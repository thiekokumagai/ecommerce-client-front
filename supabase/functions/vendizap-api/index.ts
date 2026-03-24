const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BASE_URL = "https://app.vendizap.com/api";

async function vendizapFetch(path: string) {
  const authId = Deno.env.get("VENDIZAP_AUTH_ID");
  const authSecret = Deno.env.get("VENDIZAP_AUTH_SECRET");

  if (!authId || !authSecret) {
    throw new Error("Credenciais da API Vendizap não configuradas");
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "X-Auth-Id": authId,
      "X-Auth-Secret": authSecret,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Vendizap API error [${res.status}]: ${text}`);
  }

  return res.json();
}

async function fetchAllProducts() {
  const allProducts: any[] = [];
  let skip = 0;
  const limit = 100;

  while (true) {
    const page = await vendizapFetch(`/produtos?skip=${skip}&limit=${limit}&exibir=true`);
    if (!Array.isArray(page) || page.length === 0) break;
    allProducts.push(...page);
    if (page.length < limit) break;
    skip += limit;
  }

  return allProducts.filter((p: any) => p.exibir !== false);
}

async function fetchProductDetail(id: string) {
  return vendizapFetch(`/produtos/${id}`);
}

async function fetchCategories() {
  return vendizapFetch("/categorias");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, id } = await req.json();

    let data: any;

    switch (action) {
      case "products":
        data = await fetchAllProducts();
        break;
      case "product":
        if (!id) {
          return new Response(
            JSON.stringify({ error: "ID do produto é obrigatório" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        data = await fetchProductDetail(id);
        break;
      case "categories":
        data = await fetchCategories();
        break;
      default:
        return new Response(
          JSON.stringify({ error: "Ação inválida" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Vendizap API error:", error);
    const message = error instanceof Error ? error.message : "Erro interno";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
