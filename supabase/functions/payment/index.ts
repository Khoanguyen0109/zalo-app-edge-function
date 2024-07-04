// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function combineMacData(obj) {
  return Object.keys(obj)
    .map(
      (key) =>
        `${key}=${
          typeof obj[key] === "object" ? JSON.stringify(obj[key]) : obj[key]
        }`
    )
    .join("&");
}

Deno.serve(async (req) => {
  console.log("req", req);
  const privateKey = "f48e0a5c213f6e0f86307834f7cdcea9";
  const APP_ID = "3533747193070123639";

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );
  const params = await req.json();
  const { data, mac } = params;
  console.log("data", data);
  console.log("mac", mac);
  const dataMac = combineMacData({
    appId: data.appId,
    orderId: data.orderId,
    method: data.method,
  });
  const reqmac = createHmac("sha256", privateKey);
  reqmac.update(dataMac);
  const digest = reqmac.digest("hex");
  console.log("digest", digest);
  console.log("dataMac", dataMac);
  if (digest == mac) {
    await supabaseClient
      .from("orders")
      .update({ paymentMethod: data.method })
      .eq("zaloOrderId", data.orderId);

    return new Response(
      JSON.stringify({ returnCode: 1, returnMessage: "Thanh toán thành công" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } else {
    return new Response(
      JSON.stringify({
        returnCode: 1,
        returnMessage: "Tạo Thanh toán không thành công",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/payment' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
