import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const response = await fetch("https://app.vendizap.com/api/categorias", {
      method: "GET",
      headers: {
        "X-Auth-Id": "906795",
        "X-Auth-Secret": "GHMla7Nebr#uITLn0jA9tCy?FJx%UBh1",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[fetch-categories] Vendizap API error", {
        status: response.status,
        body: errorText,
      });

      return new Response(
        JSON.stringify({ error: "Não foi possível buscar as categorias." }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const data = await response.json();
    console.log("[fetch-categories] Categories fetched", {
      count: Array.isArray(data) ? data.length : 0,
    });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[fetch-categories] Unexpected error", { error });

    return new Response(
      JSON.stringify({ error: "Erro inesperado ao buscar categorias." }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
