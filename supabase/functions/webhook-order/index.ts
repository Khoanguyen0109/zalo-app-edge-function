// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import axios from "https://deno.land/x/axiod@0.26.2/mod.ts";

Deno.serve(async (req) => {
  const params = await req.json();
  console.log("params", params);
  const { record: orders } = params;
  console.log("orders", orders);
  const YOUR_APPSHEET_ACCESS_KEY =
    "V2-FITuA-IQ2xx-cyQdy-srcAh-SMDRK-n5ZgF-LMnm2-0ZcRZ";
  const YOUR_APP_ID = "c0d71733-2765-4b2f-a7c6-308ee6438847";
  const newRecord = [
    {
      id: orders.id,
      status: orders.status,
      quantity: orders.quantity,
      preTotal: orders.preTotal,
    },
  ];
  const appsheetUrl = `https://www.appsheet.com/api/v2/apps/${YOUR_APP_ID}/tables/orders/Action`;
  const payload = {
    Action: "Edit",
    Properties: {
      Locale: "vi-VN", // Thiết lập Locale là Việt Nam
      Location: "47.623098, -122.330184",
    },
    Rows: newRecord,
  };

  try {
    const response = await axios.post(appsheetUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        applicationAccessKey: YOUR_APPSHEET_ACCESS_KEY,
      },
    });
    console.log(response.data);
  } catch (error) {
    console.error("Error posting data:", error);
    return new Response(JSON.stringify({ message: "success" }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }

  return new Response(JSON.stringify({ message: "success" }), {
    headers: { "Content-Type": "application/json" },
  });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/webhook-order' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
