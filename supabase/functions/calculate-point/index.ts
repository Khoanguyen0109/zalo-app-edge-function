// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("Hello from Functions!");

Deno.serve(async (req) => {
  const params = await req.json();
  console.log("params", params);
  const { record: orders } = params;
  console.log("orders", orders);
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  const { data: users } = await supabaseClient
    .from("users")
    .select("*")
    .eq("id", orders.userId);
  const { data: settings } = await supabaseClient.from("settings").select("*");
  const scores = settings.filter((item) => item.type === "score");
  const point = settings.find((item) => item.name === "orderPoint");
  const user = users[0];
  if (user && point) {
    const newPoint = user.totalPoint + Number(point.value);
    const newScore = scores.find((item) => newPoint <= Number(item.value));
    await supabaseClient
      .from("users")
      .update({
        memberClass: newScore?.name || user.memberClass,
        totalSpent: user.totalSpent + orders.total,
        point: user.point + Number(point.value),
        totalPoint: newPoint,
        totalOrder: user.totalOrder + 1,
      })
      .eq("id", user.id);
  }

  return new Response(
    JSON.stringify({
      message: "success",
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/calculate-point' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
