import { MessageCircle } from "lucide-react";

interface ProductContactProps {
  isDesktop?: boolean;
}

const ProductContact = ({ isDesktop = false }: ProductContactProps) => {
  if (isDesktop) {
    return (
      <div className="mt-10 text-center">
        <p className="text-[14px] text-[#7f7f7f]">Ficou com alguma dúvida?</p>
        <a
          href="https://wa.me/5567991032937"
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto mt-3 inline-flex rounded-xl border border-primary px-5 py-2.5 text-base text-primary"
        >
          Falar com o vendedor
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="mt-10 text-center">
        <p className="text-[14px] text-[#7f7f7f]">Ficou com alguma dúvida?</p>
        <a
          href="https://wa.me/5567991032937"
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto mt-3 inline-flex rounded-xl border border-primary px-5 py-2.5 text-base text-primary"
        >
          Falar com o vendedor
        </a>
      </div>

      <div className="mx-[-20px] mt-10 bg-[#f3f3f3] px-5 py-8">
        <h3 className="text-[16px] font-semibold text-[#666666]">Fale com o vendedor</h3>
        <a
          href="https://wa.me/5567991032937"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-3 text-[#8b8b8b]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary text-primary">
            <MessageCircle className="h-4 w-4" />
          </span>
          Pod & Mais
        </a>
      </div>
    </>
  );
};

export default ProductContact;