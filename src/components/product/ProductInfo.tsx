interface NicotineOption {
  label: string;
  available: boolean;
}

interface ProductInfoProps {
  productName: string;
  isNicSalt: boolean;
  productDescription: string;
  visibleSpecs: string[];
  allSpecs: string[];
  includes: string[];
  tag: string;
  nicotineOptions: NicotineOption[];
  hasNicotineOptions: boolean;
  nicotineStrength: string | null;
  showFullDescription: boolean;
  isDesktop?: boolean;
  onSelectNicotine: (value: string) => void;
  onShowMore: () => void;
}

const ProductInfo = ({
  productName,
  isNicSalt,
  productDescription,
  visibleSpecs,
  allSpecs,
  includes,
  tag,
  nicotineOptions,
  hasNicotineOptions,
  nicotineStrength,
  showFullDescription,
  isDesktop = false,
  onSelectNicotine,
  onShowMore,
}: ProductInfoProps) => {
  if (isNicSalt) {
    return (
      <div className={isDesktop ? "mt-6 space-y-5 text-[15px] leading-[1.25] text-[#6f6f6f]" : "mt-5 space-y-5 text-[16px] text-[#7a7a7a]"}>
        <p className={isDesktop ? "text-[16px] text-[#666666]" : ""}>{productDescription}</p>
        <p className={isDesktop ? "text-[16px]" : ""}>
          Tags: <span className="text-primary">BLVK</span> | <span className="text-primary">hortela</span>
        </p>

        <div className="border-t border-[#ececec] pt-4">
          {isDesktop ? (
            <div className="flex items-center gap-4">
              <p className="text-sm uppercase tracking-wide text-[#7f7f7f]">Teor de nicotina :</p>
              <div className="h-px flex-1 bg-[#ececec]" />
            </div>
          ) : (
            <p className="text-sm uppercase tracking-wide text-[#7f7f7f]">Teor de nicotina :</p>
          )}

          <div className="mt-3 space-y-3">
            {hasNicotineOptions &&
              nicotineOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => option.available && onSelectNicotine(option.label)}
                  disabled={!option.available}
                  className={`flex items-center gap-3 text-left ${
                    option.available ? "" : "cursor-not-allowed opacity-50"
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded-full border ${
                      nicotineStrength === option.label
                        ? "border-primary bg-primary"
                        : option.available
                          ? "border-[#c9c9c9] bg-[#d9d9d9]"
                          : "border-[#d8d8d8] bg-[#eeeeee]"
                    }`}
                  />
                  <span className={`text-[16px] ${option.available ? "text-[#555555]" : "text-[#9a9a9a] line-through"}`}>
                    {option.label}
                  </span>
                </button>
              ))}
          </div>
        </div>
      </div>
    );
  }

  if (isDesktop) {
    return (
      <div className="mt-5 space-y-5 text-[15px] leading-[1.25] text-[#6f6f6f]">
        <ul className="list-disc pl-5">
          {allSpecs.map((item, index) => (
            <li key={item} className={index === 0 ? "font-semibold text-[#666666]" : ""}>
              {item}
            </li>
          ))}
        </ul>

        <div>
          <h2 className="font-semibold text-[#4f4f4f]">O que inclui?</h2>
          <ul className="mt-1 list-disc pl-5">
            {includes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <p>
          Tag: <span className="text-primary">{tag}</span>
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-5 text-[16px] leading-[1.25] text-[#7a7a7a]">
        <ul className="list-disc pl-5">
          {visibleSpecs.map((item, index) => (
            <li key={item} className={index === 0 ? "font-semibold text-[#666666]" : ""}>
              {item}
            </li>
          ))}
        </ul>

        {!showFullDescription && allSpecs.length > visibleSpecs.length && (
          <button
            type="button"
            onClick={onShowMore}
            className="mt-1 text-[#4b4b4b]"
          >
            Ver mais
          </button>
        )}
      </div>

      <p className="mt-3 text-[16px] text-[#7a7a7a]">
        Tag: <span className="text-primary">{tag}</span>
      </p>
    </>
  );
};

export default ProductInfo;