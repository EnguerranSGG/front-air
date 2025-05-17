import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  try {
    const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mail: "enguerran.smagghe@hotmail.fr", password: "motdepasseair" })
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erreur côté Astro:", error);
    return new Response(
      JSON.stringify({ error: "Erreur interne côté Astro", details: error.message }),
      { status: 500 }
    );
  }
};
