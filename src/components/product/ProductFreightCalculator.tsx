import { Truck } from "lucide-react";

interface ProductFreightCalculatorProps {
  zipCode: string;
  addressNumber: string;
  isDesktop?: boolean;
  isNicSalt?: boolean;
  onZipCodeChange: (value: string) => void;
  onAddressNumberChange: (value: string) => void;
}

const ProductFreightCalculator = ({
  zipCode,
  addressNumber,
  isDesktop = false,
  isNicSalt = false,
  onZipCodeChange,
  onAddressNumberChange,
}: ProductFreightCalculatorProps) => {
  return (
    <div className={isDesktop ? "mt-8 border-t border-[#ececec] pt-4" : "mt-5 border-t border-[#ececec] pt-4"}>
      <div className={isDesktop ? "flex items-center gap-2 text-[18px] font-semibold text-[#676767]" : ""}>
        {isDesktop && !isNicSalt && <Truck className="h-5 w-5 text-primary" />}
        <h2 className="text-[18px] font-semibold text-[#676767]">Calcule o frete</h2>
      </div>

      <div className={isDesktop ? "mt-4 grid grid-cols-[minmax(0,1fr)_96px_108px] gap-2" : "mt-4 grid grid-cols-[minmax(0,1fr)_88px_92px] gap-2"}>
        <input
          value={zipCode}
          onChange={(event) => onZipCodeChange(event.target.value.replace(/[^\d-]/g, ""))}
          placeholder="Insira o CEP"
          className="h-10 rounded-full bg-[#f3f2f2] px-4 text-base text-foreground placeholder:text-[#c0c0c0] focus:outline-none md:text-sm"
        />
        <input
          value={addressNumber}
          onChange={(event) => onAddressNumberChange(event.target.value.replace(/[^\d]/g, ""))}
          placeholder={isDesktop ? "Número" : "Nº"}
          className="h-10 rounded-full bg-[#f3f2f2] px-4 text-base text-foreground placeholder:text-[#c0c0c0] focus:outline-none md:text-sm"
        />
        <button
          type="button"
          className={isDesktop ? "h-10 rounded-xl border border-primary text-sm font-medium text-primary" : "h-10 rounded-full border border-primary text-sm font-medium text-primary"}
        >
          Calcular
        </button>
      </div>
    </div>
  );
};

export default ProductFreightCalculator;