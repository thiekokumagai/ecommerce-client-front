import { ChevronLeft, Play, Search, Share2 } from "lucide-react";

interface ProductMobileGalleryProps {
  productName: string;
  images: string[];
  selectedImage: number;
  onBack: () => void;
  onOpenModal: () => void;
}

const ProductMobileGallery = ({
  productName,
  images,
  selectedImage,
  onBack,
  onOpenModal,
}: ProductMobileGalleryProps) => {
  return (
    <div className="relative bg-[#f5f5f5]">
      <button
        type="button"
        onClick={onOpenModal}
        className="block w-full"
      >
        <div className="aspect-square w-full">
          <img
            src={images[selectedImage]}
            alt={productName}
            className="h-full w-full object-contain"
          />
        </div>
      </button>

      <button
        type="button"
        onClick={onBack}
        aria-label="Voltar"
        className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={onOpenModal}
        aria-label="Ampliar imagem"
        className="absolute right-0 top-0 flex h-14 w-14 items-center justify-center rounded-bl-[28px] bg-black/20 text-white backdrop-blur-sm"
      >
        <Search className="h-5 w-5" />
      </button>


      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-[#cfc4ba] px-3 py-0.5 text-sm text-foreground/80">
        {selectedImage + 1} de {images.length}
      </div>

      <button
        type="button"
        aria-label="Compartilhar produto"
        className="absolute bottom-3 right-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#e10600] shadow-lg"
      >
        <Share2 className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ProductMobileGallery;