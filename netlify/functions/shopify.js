// This function runs on Netlify's servers, not in the browser
// It keeps your API key secret and talks to Shopify for you

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405, // Method not allowed
      body: "Only POST requests allowed",
    };
  }

  try {
    // Get the query from the request
    const { query } = JSON.parse(event.body);

    // Your Shopify store info (from environment variables)
    const SHOPIFY_STORE = process.env.SHOPIFY_STORE; // Your store name
    const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN; // Your private access token

    // Make request to Shopify
    const response = await fetch(
      `https://${SHOPIFY_STORE}.myshopify.com/admin/api/2023-10/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query }),
      }
    );

    // Get the data from Shopify
    const data = await response.json();

    // Send it back to your website
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Allow your website to access this
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    // If something went wrong, send error back
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
