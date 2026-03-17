import bannerImage from "@/assets/442164dccf88c24bee679111d86dd834.webp";

const HeroBanner = () => {
  return (
    <section className="bg-background pt-4 md:pt-8">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="overflow-hidden rounded-2xl md:rounded-3xl">
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