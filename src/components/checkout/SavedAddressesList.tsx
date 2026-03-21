import { Check, MapPin, MoreVertical, Pencil, Trash2 } from "lucide-react";
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
    <div className="space-y-3">
      {addresses.map((address) => {
        const isSelected = selectedAddressId === address.id;

        return (
          <div
            key={address.id}
            className={`rounded-2xl border bg-background p-4 shadow-sm ${
              isSelected ? "border-primary" : "border-border"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={() => onSelect(address)}
                className="flex flex-1 items-start gap-3 text-left"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-base font-semibold text-foreground">{address.mainText}</p>
                  <p className="text-sm text-muted-foreground">{address.secondaryText}</p>
                  {address.reference && (
                    <p className="mt-1 text-xs text-muted-foreground">{address.reference}</p>
                  )}
                </div>
              </button>

              <div className="flex items-center gap-1">
                {isSelected && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                )}

                <div className="group relative">
                  <button
                    type="button"
                    className="rounded-full p-1 text-muted-foreground"
                    aria-label="Mais ações"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  <div className="absolute right-0 top-8 z-10 hidden min-w-[140px] rounded-xl border border-border bg-background p-1 shadow-lg group-focus-within:block group-hover:block">
                    <button
                      type="button"
                      onClick={() => onEdit(address)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary"
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => address.id && onDelete(address.id)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-secondary"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SavedAddressesList;