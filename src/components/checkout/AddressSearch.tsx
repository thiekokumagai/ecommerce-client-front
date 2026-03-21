import { useState, useCallback, useRef, useEffect } from "react";
import { MapPin, Search, ChevronLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AddressPrediction {
  placeId: string;
  mainText: string;
  secondaryText: string;
  fullText: string;
}

export interface StructuredAddress {
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
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<AddressPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<AddressPrediction | null>(
    initialAddress ? { placeId: "", mainText: initialAddress.mainText, secondaryText: initialAddress.secondaryText, fullText: initialAddress.fullText } : null
  );
  const [complement, setComplement] = useState(initialAddress?.complement || "");
  const [reference, setReference] = useState(initialAddress?.reference || "");
  const [noComplement, setNoComplement] = useState(initialAddress?.noComplement || false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phase === "search") {
      setTimeout(() => inputRef.current?.focus(), 100);
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
        <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{selected.mainText}</p>
            <p className="text-xs text-muted-foreground">{selected.secondaryText}</p>
          </div>
          <button
            type="button"
            onClick={() => { setPhase("search"); setQuery(selected.mainText); }}
            className="text-primary"
          >
            <MapPin className="h-4 w-4" />
          </button>
        </div>

        <div>
          <input
            value={complement}
            onChange={(e) => { setComplement(e.target.value); if (e.target.value) setNoComplement(false); }}
            placeholder="Complemento *"
            disabled={noComplement}
            className="h-11 w-full rounded-xl border border-border bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 md:text-sm"
          />
          <label className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={noComplement}
              onChange={(e) => { setNoComplement(e.target.checked); if (e.target.checked) setComplement(""); }}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            Endereço sem complemento
          </label>
        </div>

        <input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Ponto de referência (opcional)"
          className="h-11 w-full rounded-xl border border-border bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none md:text-sm"
        />

        <button
          type="button"
          onClick={handleSave}
          disabled={!complement && !noComplement}
          className={`w-full rounded-xl py-3 text-sm font-semibold ${
            complement || noComplement ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          Salvar endereço
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Buscar endereço"
          className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none md:text-sm"
        />
        {isLoading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
      </div>

      {query.length >= 3 && (
        <p className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
          powered by <span className="font-medium">Google</span>
        </p>
      )}

      {predictions.length > 0 && (
        <div className="space-y-1 rounded-xl border border-border bg-background p-1">
          {predictions.map((p) => (
            <button
              key={p.placeId}
              type="button"
              onClick={() => handleSelect(p)}
              className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-secondary"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">{p.mainText}</p>
                <p className="text-xs text-muted-foreground">{p.secondaryText}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {query.length >= 3 && predictions.length === 0 && !isLoading && (
        <p className="px-2 py-3 text-center text-sm text-muted-foreground">Nenhum endereço encontrado</p>
      )}

      {initialAddress && (
        <button
          type="button"
          onClick={onCancel}
          className="w-full rounded-xl border border-border py-3 text-sm font-medium text-foreground"
        >
          Cancelar
        </button>
      )}
    </div>
  );
};

export default AddressSearch;
