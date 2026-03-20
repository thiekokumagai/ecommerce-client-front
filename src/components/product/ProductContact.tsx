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
    <div className="mt-10 text-center">
      <p className="text-[14px] text-[#7f7f7f]">Ficou com alguma dúvida?</p>
      <a
        href="https://wa.me/5567991032937"
        target="_blank"
        rel="noopener noreferrer"
        className="mx-auto mt-3 inline-flex rounded-xl border border-primary px-5 py-2.5 text-base text-primary"
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        Falar com o vendedor
      </a>
    </div>
  );
};

export default ProductContact;