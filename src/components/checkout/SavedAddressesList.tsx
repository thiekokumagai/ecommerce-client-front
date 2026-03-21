import { Check, MapPin, Pencil, Trash2 } from "lucide-react";
import type { StructuredAddress } from "@/components/checkout/AddressSearch";

interface SavedAddressesListProps {
  addresses: StructuredAddress[];
  selectedAddressId?: string;
  onSelect: (address: StructuredAddress) => void;
  onEdit: (address: StructuredAddress) => void;
  onDelete: (addressId: string) => void;
}

const SavedAddressesList = ({
  addresses,
  selectedAddressId,
  onSelect,
  onEdit,
  onDelete,
}: SavedAddressesListProps) => {
  if (addresses.length === 0) return null;

  return (
    <div className="rounded-3xl bg-card p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground">Endereços salvos</h3>
      <div className="mt-4 space-y-3">
        {addresses.map((address) => {
          const isSelected = selectedAddressId === address.id;

          return (
            <div
              key={address.id}
              className={`rounded-2xl border p-4 ${
                isSelected ? "border-primary bg-primary/5" : "border-border bg-background"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(address)}
                className="flex w-full items-start justify-between gap-3 text-left"
              >
                <div className="flex gap-3">
                  <div
                    className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl ${
                      isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {isSelected ? <Check className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{address.mainText}</p>
                    <p className="text-xs text-muted-foreground">{address.secondaryText}</p>
                    {address.complement && (
                      <p className="mt-1 text-xs text-muted-foreground">Compl: {address.complement}</p>
                    )}
                    {address.reference && (
                      <p className="text-xs text-muted-foreground">Ref: {address.reference}</p>
                    )}
                  </div>
                </div>
              </button>

              <div className="mt-3 flex items-center gap-4 pl-12">
                <button
                  type="button"
                  onClick={() => onEdit(address)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => address.id && onDelete(address.id)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SavedAddressesList;