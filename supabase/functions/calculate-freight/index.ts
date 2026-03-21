const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ORIGIN_ADDRESS = "Rua Glauce Rocha 539, Campo Grande, MS, Brasil";

const PRICING_TIERS = [
  { maxKm: 4, price: 10 },
  { maxKm: 6, price: 12 },
  { maxKm: 8, price: 15 },
  { maxKm: 12, price: 20 },
  { maxKm: 15, price: 22 },
  { maxKm: 17, price: 25 },
  { maxKm: 20, price: 30 },
  { maxKm: 32, price: 35 },
];

function getFreightPrice(distanceKm: number): number | null {
  for (const tier of PRICING_TIERS) {
    if (distanceKm <= tier.maxKm) return tier.price;
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { destination } = await req.json();

    if (!destination || typeof destination !== "string") {
      return new Response(
        JSON.stringify({ error: "Endereço de destino é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Chave da API não configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use Google Maps Routes API
    const routesResponse = await fetch(
      "https://routes.googleapis.com/directions/v2:computeRoutes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
        },
        body: JSON.stringify({
          origin: { address: ORIGIN_ADDRESS },
          destination: { address: destination },
          travelMode: "DRIVE",
        }),
      }
    );

    if (!routesResponse.ok) {
      const errorText = await routesResponse.text();
      console.error("Google Maps API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao calcular rota. Verifique o endereço." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const routesData = await routesResponse.json();

    if (!routesData.routes || routesData.routes.length === 0) {
      return new Response(
        JSON.stringify({ error: "Não foi possível calcular a rota para este endereço." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const distanceMeters = routesData.routes[0].distanceMeters;
    const distanceKm = distanceMeters / 1000;
    const duration = routesData.routes[0].duration;

    const freightPrice = getFreightPrice(distanceKm);

    if (freightPrice === null) {
      return new Response(
        JSON.stringify({
          error: "Endereço fora da área de entrega (máximo 32km).",
          distanceKm: Math.round(distanceKm * 10) / 10,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        distanceKm: Math.round(distanceKm * 10) / 10,
        duration,
        freightPrice,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
