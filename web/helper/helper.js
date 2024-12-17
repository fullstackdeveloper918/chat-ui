import db_con from "../db.js";

// Helper object to store utility functions
const Helper = {};

// Fetch session data
export const getSessionData = async (res) => {
  try {
    const currentUserSession = res.locals.shopify.session;

    if (!currentUserSession) {
      throw new Error("Session data is not available");
    }

    return currentUserSession; // Return session data
  } catch (error) {
    // Handle error and rethrow for further handling
    console.error("Error retrieving session data:", error.message);
    throw error;
  }
};

// Fetch store languages based on session data
Helper.getStoreLanguages = async (sessionData) => {
  try {
    const { accessToken, shop } = await sessionData;

    if (!accessToken || !shop) {
      throw new Error("Invalid session data.");
    }

    const apiUrl = `https://${shop}/admin/api/2023-10/store_locales.json`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Shopify API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Return locales or default to "en" if no locales found
    return data.locales && data.locales.length > 0 ? data.locales : ["en"];
  } catch (error) {
    // Log error and return default language in case of failure
    console.error("Error fetching store languages:", error.message);
    return ["en"]; // Default to English
  }
};

// Get API key for a given shop
const getApiKey = (shop) => {
  return new Promise((resolve, reject) => {
    const query =
      "SELECT api_key FROM apikey WHERE domain = ? AND deleted_at IS NULL";

    db_con.query(query, [shop], (error, results) => {
      if (error) {
        console.error("Error querying database for API key:", error);
        return reject(new Error("Database error"));
      }

      if (results.length > 0) {
        resolve(results[0].api_key); // Return API key
      } else {
        reject(new Error("Shop not found or inactive"));
      }
    });
  });
};

// Get shop info using session data
Helper.getShopInfo = async (sessionData) => {
  try {
    const { accessToken, shop } = await sessionData;

    if (!accessToken || !shop) {
      throw new Error("Invalid session data.");
    }

    const apiKey = await getApiKey(shop); // Get API key for the shop
    return apiKey;
  } catch (error) {
    console.error("Error in getShopInfo:", error.message);
    throw error; // Rethrow error for handling in caller
  }
};

// Fetch store info based on session data
Helper.storeInfo = async (sessionData) => {
  try {
    const { accessToken, shop } = await sessionData;

    if (!accessToken || !shop) {
      throw new Error("Invalid session data.");
    }

    const apiKey = await getApiKey(shop); // Get API key for the shop
    const apiUrl = `https://${shop}/admin/api/2024-10/shop.json`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Error fetching store info: ${response.status} ${response.statusText}`
      );
    }
    console.log("storeinfo",response.status);
    return await response.json(); // Return store info as JSON
  } catch (error) {
    // Log the error and rethrow
    console.error("Error in storeInfo:", error.message);
    throw error;
  }
};


Helper.addWebhook = async(shop, plane) =>{
  
 
}





export default Helper;
