// ===================================================================
// PRODUCTS.JS - GETS COLLECTIONS AND SHOWS PRODUCTS ON CLICK
// ===================================================================
// This file gets collections and lets you click to see products

// Global variable to store all collections data
let allCollections = [];

// ===================================================================
// FUNCTION: CALL SHOPIFY API VIA NETLIFY FUNCTION
// ===================================================================
// This talks to our Netlify function (which safely talks to Shopify)
async function callShopifyAPI(query) {
  // Start function that talks to Shopify
  try {
    // Try to do this, if it fails go to catch
    // Call our Netlify function
    const response = await fetch("/api/shopify", {
      // Ask our Netlify function for data
      method: "POST", // Tell function we're sending data
      headers: {
        // Extra info about our request
        "Content-Type": "application/json", // We're sending JSON data
      },
      body: JSON.stringify({
        // Convert our data to text
        query: query, // Send the Shopify query
      }),
    });

    // Get the response as JSON
    const data = await response.json();

    // Log everything for debugging
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));

    // Check if there were errors
    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    // Return the data
    return data.data;
  } catch (error) {
    // If anything went wrong
    console.error("Shopify API error:", error); // Log error to console
    throw error; // Pass error up to whoever called this function
  }
} // End of function

// ===================================================================
// FUNCTION: GET COLLECTIONS FROM SHOPIFY
// ===================================================================
// This gets collections from your Shopify store
async function getCollections() {
  // GraphQL query for Storefront API - get collections with their products
  const query = `
    {
      collections(first: 10) {
        edges {
          node {
            id
            title
            handle
            description
            image {
              url
              altText
            }
            products(first: 20) {
              edges {
                node {
                  id
                  title
                  handle
                  description
                  priceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                    maxVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                  images(first: 1) {
                    edges {
                      node {
                        url
                        altText
                      }
                    }
                  }
                  variants(first: 5) {
                    edges {
                      node {
                        id
                        title
                        price {
                          amount
                          currencyCode
                        }
                        quantityAvailable
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  // Call Shopify and get the data
  const data = await callShopifyAPI(query);

  // Safety check
  if (!data || !data.collections) {
    console.error('No collections data received:', JSON.stringify(data, null, 2));
    return [];
  }

  // Return just the collections
  return data.collections.edges;
} // End of function

// ===================================================================
// FUNCTION: DISPLAY COLLECTIONS ON PAGE
// ===================================================================
// Shows collection names that you can click to see products
function displayCollections(collections) {
  // Find where to put collections on the page
  const container = document.getElementById("collections-container");
  const template = document.getElementById("collection-template");

  // Check if we got any collections
  if (collections.length === 0) {
    container.innerHTML = '<p class="error">No collections found</p>'; // Show error message
    return; // Stop here
  }

  // Store collections data globally so we can use it when clicked
  allCollections = collections;

  // Create the grid to hold collection names
  container.innerHTML = '<div class="collections-grid"></div>';
  const grid = container.querySelector('.collections-grid');

  // Loop through each collection and create clickable names
  collections.forEach((collectionEdge, index) => {
    const collection = collectionEdge.node; // Get collection data
    const clone = template.content.cloneNode(true); // Copy the template

    // Fill in the collection name
    const titleElement = clone.querySelector('.collection-title');
    titleElement.textContent = collection.title; // Set the name
    titleElement.style.cursor = 'pointer'; // Make it look clickable
    titleElement.style.color = '#007cba'; // Make it blue like a link
    titleElement.style.textDecoration = 'underline'; // Add underline

    // Add click event to show products when clicked
    titleElement.addEventListener('click', () => {
      showProductsForCollection(index); // Call function to show products
    });

    // Add the collection to the page
    grid.appendChild(clone);
  });
}

// ===================================================================
// FUNCTION: LOAD COLLECTIONS (CALLED BY BUTTON)
// ===================================================================
// This is the main function that gets called when you click the button
async function loadCollections() {
  // Start main function
  const container = document.getElementById("collections-container"); // Find where collections go

  try {
    // Try to do this, if it fails go to catch
    // Show loading message
    container.innerHTML = '<p class="loading">Loading collections...</p>'; // Show "loading" while we wait

    // Get collections from Shopify
    const collections = await getCollections(); // Get collections from Shopify

    // Display them on the page
    displayCollections(collections); // Show collections on page

    console.log("Loaded", collections.length, "collections"); // Log success to console
  } catch (error) {
    // If anything went wrong
    // Show error message
    container.innerHTML = `<p class="error">Error: ${error.message}</p>`; // Show error on page
    console.error("Error loading collections:", error); // Log error to console
  }
} // End of main function

// ===================================================================
// THAT'S IT! SIMPLE AND CLEAN
// ===================================================================
// This file does exactly one thing:
// 1. Gets collections from Shopify (through our secure Netlify function)
// 2. Displays them on the webpage
//
// No cart, no complex features - just basic collection display
