import * as React from "react";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import bannerImage from "@/assets/banner.jpg"; // fallback
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const HeroBanner = () => {
  const { data: settings } = useStoreSettings();
  
  const banners = settings?.bannerUrls?.length ? settings.bannerUrls : [bannerImage];

  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false })
  );

  return (
    <section className="bg-background pt-[120px] md:pt-8">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <Carousel 
          className="w-full relative rounded-sm md:rounded-sm overflow-hidden group" 
          opts={{ loop: true }}
          plugins={[plugin.current]}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent className="ml-0">
            {banners.map((url, i) => (
              <CarouselItem key={i} className="pl-0 min-w-full">
                <img
                  src={url}
                  alt={`Banner da loja ${i + 1}`}
                  className="block w-full object-cover"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {banners.length > 1 && (
            <>
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </>
          )}
        </Carousel>
      </div>
    </section>
  );
};

export default HeroBanner;
