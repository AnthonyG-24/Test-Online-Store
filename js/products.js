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
    const data = await response.json(); // Turn function response into usable data

    // Check if there were errors
    if (data.errors) {
      // If Shopify sent back errors
      throw new Error(data.errors[0].message); // Stop and show error
    }

    // Return the data
    return data.data; // Give back the good data
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
  // GraphQL query to get collections with their products
  const query = ` // This is the request we send to Shopify
        {
            collections(first: 10) { // Get first 10 collections
                edges { // Shopify wraps data in "edges"
                    node { // Each "node" is one collection
                        id // Collection ID
                        title // Collection name
                        handle // URL-friendly name
                        description // Collection description
                        image { // Collection image info
                            url // Image web address
                            altText // Description for screen readers
                        }
                        products(first: 20) { // Get first 20 products in this collection
                            edges { // Products also wrapped in edges
                                node { // Each product
                                    id // Product ID
                                    title // Product name
                                    handle // URL-friendly product name
                                    description // Product description
                                    totalInventory // How many in stock
                                    priceRange { // Price info
                                        minVariantPrice { // Lowest price
                                            amount // Price number
                                            currencyCode // Currency (USD, CAD, etc)
                                        }
                                        maxVariantPrice { // Highest price
                                            amount // Price number
                                            currencyCode // Currency
                                        }
                                    }
                                    variants(first: 10) { // Product options (size, color, etc)
                                        edges {
                                            node {
                                                id // Variant ID
                                                title // Variant name (like "Small / Red")
                                                price { // Variant price
                                                    amount
                                                    currencyCode
                                                }
                                                quantityAvailable // How many of this variant in stock
                                                selectedOptions { // The options (size, color)
                                                    name // Option name (Size)
                                                    value // Option value (Small)
                                                }
                                            }
                                        }
                                    }
                                    images(first: 5) { // Product images
                                        edges {
                                            node {
                                                url // Image web address
                                                altText // Image description
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
    `; // End of query

  // Call Shopify and get the data
  const data = await callShopifyAPI(query); // Send query to Shopify

  // Return just the collections
  return data.collections.edges; // Give back the list of collections
} // End of function

// ===================================================================
// FUNCTION: DISPLAY COLLECTIONS WITH PRODUCTS ON PAGE
// ===================================================================
// This puts the collections and their products on the webpage
function displayCollections(collections) {
  // Start function to show collections
  // Find the HTML element where we'll display everything
  const container = document.getElementById("collections-container"); // Find the div where collections go
  // Get the templates from the HTML
  const collectionTemplate = document.getElementById("collection-template"); // Find collection template
  const productTemplate = document.getElementById("product-template"); // Find product template

  // Check if we have any collections to display
  if (collections.length === 0) {
    // If no collections came back
    // No collections found, show error message
    container.innerHTML = '<p class="error">No collections found</p>'; // Show error message
    return; // Exit the function early
  }

  // Create the main container
  container.innerHTML = '<div class="collections-container"></div>'; // Make container to hold everything
  const mainContainer = container.querySelector(".collections-container"); // Find the container we just made

  // Loop through each collection
  collections.forEach((collectionEdge) => {
    // Do this for each collection
    // Extract the actual collection data
    const collection = collectionEdge.node; // Get the actual collection data

    // Clone the collection template
    const collectionClone = collectionTemplate.content.cloneNode(true); // Make a copy of collection template

    // Fill in the collection data
    collectionClone.querySelector(".collection-title").textContent =
      collection.title; // Put collection name
    collectionClone.querySelector(".collection-description").textContent = // Put description
      collection.description || "No description"; // Use description or default text

    // Handle collection image
    if (collection.image) {
      // If collection has an image
      const img = collectionClone.querySelector(".collection-img"); // Find the image element
      img.src = collection.image.url; // Set image source
      img.alt = collection.image.altText || collection.title; // Set image description
      img.classList.remove("hidden"); // Make image visible
    } else {
      // If no image
      collectionClone
        .querySelector(".no-image-placeholder")
        .classList.remove("hidden"); // Show "No Image" text
    }

    // Get the products grid for this collection
    const productsGrid = collectionClone.querySelector(".products-grid"); // Find where products go

    // Add products to this collection
    if (collection.products.edges.length > 0) {
      // If this collection has products
      collection.products.edges.forEach((productEdge) => {
        // Do this for each product
        const product = productEdge.node; // Get the actual product data

        // Clone the product template
        const productClone = productTemplate.content.cloneNode(true); // Make copy of product template

        // Fill in product data
        productClone.querySelector(".product-title").textContent =
          product.title; // Product name
        productClone.querySelector(".product-description").textContent = // Product description
          product.description || "No description"; // Use description or default

        // Set product price
        const priceElement = productClone.querySelector(".product-price"); // Find price area
        if (
          product.priceRange.minVariantPrice.amount ===
          product.priceRange.maxVariantPrice.amount
        ) {
          // Same price for all variants
          priceElement.textContent = `$${product.priceRange.minVariantPrice.amount} ${product.priceRange.minVariantPrice.currencyCode}`;
        } else {
          // Price range
          priceElement.textContent = `$${product.priceRange.minVariantPrice.amount} - $${product.priceRange.maxVariantPrice.amount} ${product.priceRange.minVariantPrice.currencyCode}`;
        }

        // Set inventory info
        const inventoryElement =
          productClone.querySelector(".product-inventory"); // Find inventory area
        inventoryElement.textContent = `Stock: ${
          product.totalInventory || 0
        } units`; // Show total stock

        // Handle product image
        if (product.images.edges.length > 0) {
          // If product has images
          const img = productClone.querySelector(".product-img"); // Find image element
          img.src = product.images.edges[0].node.url; // Use first image
          img.alt = product.images.edges[0].node.altText || product.title; // Set description
          img.classList.remove("hidden"); // Make image visible
        } else {
          // If no images
          productClone
            .querySelector(".no-image-placeholder")
            .classList.remove("hidden"); // Show "No Image"
        }

        // Add variants info
        const variantsElement = productClone.querySelector(".product-variants"); // Find variants area
        if (product.variants.edges.length > 0) {
          // If product has variants
          let variantsHTML = "<strong>Options:</strong><ul>"; // Start list
          product.variants.edges.forEach((variantEdge) => {
            // For each variant
            const variant = variantEdge.node; // Get variant data
            variantsHTML += `<li>${variant.title} - $${variant.price.amount} (${variant.quantityAvailable} available)</li>`;
          });
          variantsHTML += "</ul>"; // End list
          variantsElement.innerHTML = variantsHTML; // Put variants on page
        }

        // Add this product to the products grid
        productsGrid.appendChild(productClone); // Put product in this collection
      });
    } else {
      // If no products in this collection
      productsGrid.innerHTML =
        '<p class="no-products">No products in this collection</p>'; // Show message
    }

    // Add this collection (with its products) to the main container
    mainContainer.appendChild(collectionClone); // Put whole collection on page
  }); // End of loop through collections
} // End of function

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
