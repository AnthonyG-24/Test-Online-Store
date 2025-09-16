// ===================================================================
// PRODUCTS.JS - ONLY GETS COLLECTIONS AND DISPLAYS THEM
// ===================================================================
// This file does one simple thing: gets collections from Shopify and shows them

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
// This gets all collections from your Shopify store
async function getCollections() {
  // Start function to get collections
  // Simple GraphQL query to just get collections
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
                    }
                }
            }
        }
    `;

  // Call Shopify and get the data
  const data = await callShopifyAPI(query); // Send query to Shopify

  // Return just the collections
  return data.collections.edges;
} // End of function

// ===================================================================
// FUNCTION: DISPLAY COLLECTIONS ON PAGE (SIMPLE VERSION)
// ===================================================================
// This just shows basic collection info
function displayCollections(collections) {
  const container = document.getElementById("collections-container");
  const template = document.getElementById("collection-template");

  if (collections.length === 0) {
    container.innerHTML = '<p class="error">No collections found</p>';
    return;
  }

  container.innerHTML = '<div class="collections-grid"></div>';
  const grid = container.querySelector('.collections-grid');

  collections.forEach(collectionEdge => {
    const collection = collectionEdge.node;
    const clone = template.content.cloneNode(true);

    // Fill in basic collection info
    clone.querySelector('.collection-title').textContent = collection.title;
    clone.querySelector('.collection-description').textContent =
      collection.description || 'No description';

    // Handle image
    if (collection.image) {
      const img = clone.querySelector('.collection-img');
      img.src = collection.image.url;
      img.alt = collection.image.altText || collection.title;
      img.classList.remove('hidden');
    } else {
      clone.querySelector('.no-image-placeholder').classList.remove('hidden');
    }

    // Remove products grid since we're not showing products yet
    const productsGrid = clone.querySelector('.products-grid');
    if (productsGrid) {
      productsGrid.remove();
    }

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
