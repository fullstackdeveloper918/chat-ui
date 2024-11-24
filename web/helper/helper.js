const Helper = {};
import db_con from "../db.js";

export const getSessionData = async (res) => {
  try {
    // Assuming you're using some server-side context to get the session data

    const currentUserSession = res.locals.shopify.session;

    if (!currentUserSession) {
      throw new Error("Session data is not available");
    }

    return currentUserSession; // Return session data instead of sending a response
  } catch (error) {
    //console.error("Error retrieving session data:", error.message);
    throw error; // Throw the error to be handled by the caller
  }
};

Helper.getStoreLanguages = async (sessionData) => {
  try {
    // Await the session data before proceeding
    const sessionDataResponse = await sessionData;
    //console.log("sessionDataResponse", sessionDataResponse.shop);

    if (
      !sessionDataResponse ||
      !sessionDataResponse.accessToken ||
      !sessionDataResponse.shop
    ) {
      throw new Error("Invalid session data.");
    }

    const { accessToken, shop } = sessionDataResponse;
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
    //console.log("datalamnh", data);

    // Return the locales or default to "en" (English) if no locales are found
    if (data.locales && data.locales.length > 0) {
      return data.locales;
    } else {
      //console.log("No locales found, returning default language: English (en).");
      return ["en"]; // Default to English if no locales found
    }
  } catch (error) {
    // //console.error("Error fetching store languages:", error.message);
    // If there's an error, default to English
    return ["en"]; // Default to English in case of error
  }
};

const geyApikey = (shop) => {
  return new Promise((resolve, reject) => {
    const query =
      "SELECT api_key FROM apikey WHERE domain = ? AND deleted_at IS NULL";

    db_con.query(query, [shop], (error, results) => {
      if (error) {
        console.error("Error checking if store exists: ", error);
        return reject(new Error("Database error"));
      }

      // If no results, reject with a specific error message
      if (results.length > 0) {
        resolve(results[0].api_key); // Return the API key
      } else {
        reject(new Error("Shop not found or inactive"));
      }
    });
  });
};

Helper.getShopInfo = async (sessionData) => {
  try {
    // Wait for the sessionData promise to resolve
    const sessionDataResponse = await sessionData;

    if (
      !sessionDataResponse ||
      !sessionDataResponse.accessToken ||
      !sessionDataResponse.shop
    ) {
      throw new Error("Invalid session data.");
    }

    const { accessToken, shop } = sessionDataResponse;

    // Fetch the API key for the given shop
    const apiKey = await geyApikey(shop); // Await the result of geyApikey

    // Log the shop info (optional)
    console.log(`Shop: ${shop}, API Key: ${apiKey}`);

    //return { accessToken, shop, apiKey };
    return apiKey;
  } catch (error) {
    console.error("Error in getShopInfo:", error.message);
    throw error; // Rethrow the error so the caller can handle it
  }
};

export default Helper;
