import { Play, Share2 } from "lucide-react";

interface ProductDesktopGalleryProps {
  productName: string;
  images: string[];
  selectedImage: number;
  isNicSalt: boolean;
  onSelectImage: (index: number) => void;
  onOpenModal: () => void;
}

const ProductDesktopGallery = ({
  productName,
  images,
  selectedImage,
  isNicSalt,
  onSelectImage,
  onOpenModal,
}: ProductDesktopGalleryProps) => {
  return (
    <div className={`grid items-start gap-4 pt-16 grid-cols-[82px_1fr]`}>
      {!isNicSalt && (
        <div className="flex flex-col gap-3">

          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => onSelectImage(index)}
              className={`overflow-hidden rounded-2xl border-2 ${selectedImage === index ? "border-primary" : "border-transparent"}`}
            >
              <img
                src={image}
                alt={`${productName} ${index + 1}`}
                className="aspect-square w-[78px] object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <div className={`relative w-full overflow-hidden bg-[#f6f5f3] max-w-[440px] rounded-[14px]`}>
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
          aria-label="Compartilhar produto"
          className="absolute right-[-10px] top-[-10px] flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary shadow-md"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ProductDesktopGallery;