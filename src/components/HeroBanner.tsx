import { useStoreSettings } from "@/hooks/useStoreSettings";
import bannerImage from "@/assets/banner.jpg"; // fallback

const HeroBanner = () => {
  const { data: settings } = useStoreSettings();
  
  const banners = settings?.bannerUrls?.length ? settings.bannerUrls : [bannerImage];

  return (
    <section className="bg-background pt-[120px] md:pt-8">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex snap-x snap-mandatory overflow-x-auto scrollbar-none rounded-sm md:rounded-sm">
          {banners.map((url, i) => (
            <div key={i} className="min-w-full snap-start">
              <img
                src={url}
                alt="Banner da loja"
                className="block h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;