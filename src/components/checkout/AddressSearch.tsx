import { useState, useCallback, useRef, useEffect } from "react";
import { MapPin, Search, Loader2, Check, ChevronLeft, X, Pencil } from "lucide-react";
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
      <div className="flex h-full flex-col bg-background">
        <div className="flex items-center gap-3 border-b border-border px-4 py-4">
          <button
            type="button"
            onClick={() => setPhase("search")}
            className="rounded-full p-1 text-muted-foreground"
            aria-label="Voltar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-foreground">{selected.mainText}</p>
            <p className="truncate text-sm text-muted-foreground">{selected.secondaryText}</p>
          </div>
          <button
            type="button"
            onClick={() => setPhase("search")}
            className="rounded-full p-1 text-muted-foreground"
            aria-label="Editar endereço"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <div>
            <input
              value={complement}
              onChange={(e) => {
                setComplement(e.target.value);
                if (e.target.value) setNoComplement(false);
              }}
              placeholder="Complemento *"
              disabled={noComplement}
              className="h-14 w-full rounded-2xl border border-border bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
            />
            <label className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={noComplement}
                onChange={(e) => {
                  setNoComplement(e.target.checked);
                  if (e.target.checked) setComplement("");
                }}
                className="h-5 w-5 rounded border-border accent-primary"
              />
              Endereço sem complemento
            </label>
          </div>

          <div>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ponto de referência (opcional)"
              className="h-14 w-full rounded-2xl border border-border bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        <div className="border-t border-border p-4">
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
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center gap-3 border-b border-border px-4 py-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full p-1 text-muted-foreground"
          aria-label="Fechar busca de endereço"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Buscar endereço e número"
            className="h-12 w-full rounded-xl border border-border bg-secondary pl-11 pr-10 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setPredictions([]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {isLoading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {query.length >= 3 && (
          <p className="mb-3 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
            powered by <span className="font-medium">Google</span>
          </p>
        )}

        {predictions.length > 0 && (
          <div className="space-y-1">
            {predictions.map((prediction, index) => (
              <button
                key={prediction.placeId}
                type="button"
                onClick={() => handleSelect(prediction)}
                className={`flex w-full items-start gap-3 py-4 text-left ${
                  index !== predictions.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">{prediction.mainText}</p>
                  <p className="text-sm text-muted-foreground">{prediction.secondaryText}</p>
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
      </div>
    </div>
  );
};

export default AddressSearch;