import logo from "@/assets/logo.webp";

const HeroBanner = () => {
  return (
    <section className="bg-background pt-4 md:pt-8">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="overflow-hidden rounded-2xl bg-brand-gradient md:rounded-3xl">
          <div className="flex min-h-[180px] flex-col items-center justify-center gap-4 px-6 py-10 text-center md:min-h-[280px] md:px-12">
            <img
              src={logo}
              alt="Pod & Mais"
              className="h-20 w-20 object-contain md:h-28 md:w-28"
            />
            <div className="space-y-2">
              <h1 className="font-display text-2xl font-bold text-white md:text-4xl">
                Pod & Mais
              </h1>
              <p className="mx-auto max-w-2xl text-sm text-white/90 md:text-lg">
                Pods, juices, nic salts e acessórios com atendimento em Campo Grande e envio para todo o Brasil.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;