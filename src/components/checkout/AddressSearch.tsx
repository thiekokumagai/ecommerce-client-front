import { useState, useCallback, useRef, useEffect } from "react";
import { MapPin, Search, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AddressPrediction {
  placeId: string;
  mainText: string;
  secondaryText: string;
  fullText: string;
}

export interface StructuredAddress {
  id?: string;
  mainText: string;
  secondaryText: string;
  fullText: string;
  complement: string;
  reference: string;
  noComplement: boolean;
}

interface AddressSearchProps {
  onSave: (address: StructuredAddress) => void;
  onCancel: () => void;
  initialAddress?: StructuredAddress | null;
}

const AddressSearch = ({ onSave, onCancel, initialAddress }: AddressSearchProps) => {
  const [phase, setPhase] = useState<"search" | "details">(initialAddress ? "details" : "search");
  const [query, setQuery] = useState(initialAddress?.fullText || "");
  const [predictions, setPredictions] = useState<AddressPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<AddressPrediction | null>(
    initialAddress
      ? {
          placeId: initialAddress.id || "",
          mainText: initialAddress.mainText,
          secondaryText: initialAddress.secondaryText,
          fullText: initialAddress.fullText,
        }
      : null
  );
  const [complement, setComplement] = useState(initialAddress?.complement || "");
  const [reference, setReference] = useState(initialAddress?.reference || "");
  const [noComplement, setNoComplement] = useState(initialAddress?.noComplement || false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phase === "search") {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const fetchPredictions = useCallback(async (input: string) => {
    if (input.trim().length < 3) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await supabase.functions.invoke("autocomplete-address", {
        body: { input },
      });
      setPredictions(data?.predictions || []);
    } catch {
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPredictions(value), 350);
  };

  const handleSelect = (prediction: AddressPrediction) => {
    setSelected(prediction);
    setPhase("details");
  };

  const handleSave = () => {
    if (!selected) return;

    onSave({
      id: initialAddress?.id || crypto.randomUUID(),
      mainText: selected.mainText,
      secondaryText: selected.secondaryText,
      fullText: selected.fullText,
      complement,
      reference,
      noComplement,
    });
  };

  if (phase === "details" && selected) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{selected.mainText}</p>
                <p className="text-xs text-muted-foreground">{selected.secondaryText}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setPhase("search");
                setQuery(selected.fullText);
              }}
              className="text-sm font-medium text-primary"
            >
              Trocar
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Complemento</label>
            <input
              value={complement}
              onChange={(e) => {
                setComplement(e.target.value);
                if (e.target.value) setNoComplement(false);
              }}
              placeholder="Casa, apto, bloco, sala..."
              disabled={noComplement}
              className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 md:text-sm"
            />
            <label className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={noComplement}
                onChange={(e) => {
                  setNoComplement(e.target.checked);
                  if (e.target.checked) setComplement("");
                }}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              Endereço sem complemento
            </label>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Ponto de referência</label>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Opcional"
              className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none md:text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-border bg-background py-3 text-sm font-medium text-foreground"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!complement && !noComplement}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold ${
              complement || noComplement ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            <Check className="h-4 w-4" />
            Salvar endereço
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Digite rua, número ou bairro"
          className="h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-10 text-base text-foreground placeholder:text-muted-foreground focus:outline-none md:text-sm"
        />
        {isLoading && <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
      </div>

      {query.length >= 3 && (
        <p className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
          powered by <span className="font-medium">Google</span>
        </p>
      )}

      {predictions.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          {predictions.map((prediction, index) => (
            <button
              key={prediction.placeId}
              type="button"
              onClick={() => handleSelect(prediction)}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary ${
                index !== predictions.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{prediction.mainText}</p>
                <p className="text-xs text-muted-foreground">{prediction.secondaryText}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {query.length >= 3 && predictions.length === 0 && !isLoading && (
        <p className="rounded-2xl bg-background px-4 py-4 text-center text-sm text-muted-foreground">
          Nenhum endereço encontrado
        </p>
      )}

      <button
        type="button"
        onClick={onCancel}
        className="w-full rounded-2xl border border-border bg-background py-3 text-sm font-medium text-foreground"
      >
        Cancelar
      </button>
    </div>
  );
};

export default AddressSearch;