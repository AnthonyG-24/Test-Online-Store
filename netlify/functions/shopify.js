exports.handler = async (event, context) => {
  // Add CORS headers for all responses
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Only POST requests allowed" })
    };
  }

  try {
    // Get the query from the request
    const { query } = JSON.parse(event.body);

    // Hardcode credentials for testing
    const SHOPIFY_STORE = "FakeBrandBobBurgers";
    const SHOPIFY_ACCESS_TOKEN = "YOUR_STOREFRONT_TOKEN_HERE"; // Replace with your Storefront API token

    // Make request to Shopify Storefront API
    const response = await fetch(
      `https://${SHOPIFY_STORE}.myshopify.com/api/2023-10/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query }),
      }
    );

    const data = await response.json();

    // Return the data regardless of status for debugging
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
