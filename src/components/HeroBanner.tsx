import bannerImage from "@/assets/banner.jpg";

const HeroBanner = () => {
  return (
    <section className="bg-background pt-[120px] md:pt-8">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="overflow-hidden rounded-sm md:rounded-sm">
          <img
            src={bannerImage}
            alt="Nosso horário de atendimento mudou"
            className="block h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;