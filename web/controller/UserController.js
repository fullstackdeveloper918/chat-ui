import db_con from "../db.js";
import axios from "axios";
import Helper, { getSessionData } from "../helper/helper.js";
import fs from 'fs';


// Controller for user-related actions
const UserController = {};

// Function to add webhooks to the Shopify store
const addWebhooks = async (session) => {
  try {
    const { shop: shopDomain, accessToken } = session;

      
    // Webhook definitions
    const webhooks = [
      { topic: 'products/create', address: `${process.env.SHOPIFY_WEBHOOK_PRODUCT_CREATE}`, format: 'json' },
      { topic: 'products/update', address: `${process.env.SHOPIFY_WEBHOOK_PRODUCT_UPDATE}`, format: 'json' },
      { topic: 'products/delete', address: `${process.env.SHOPIFY_WEBHOOK_PRODUCT_DELETE}`, format: 'json' },
    ];

    const results = [];

    // Fetch existing webhooks
    const existingWebhooksResponse = await fetch(`https://${shopDomain}/admin/api/2024-01/webhooks.json`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
    });

    const existingWebhooks = await existingWebhooksResponse.json();

    // Loop through webhooks and add each to the store if not already registered
    for (const webhook of webhooks) {
      const isWebhookExisting = existingWebhooks.webhooks.some(existingWebhook => existingWebhook.topic === webhook.topic);
      
      if (isWebhookExisting) {
        results.push({
          topic: webhook.topic,
          success: false,
          message: 'Webhook already exists',
        });
        continue; // Skip creating the webhook if it already exists
      }

      // Add webhook if it doesn't exist
      const response = await fetch(`https://${shopDomain}/admin/api/2024-01/webhooks.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({ webhook }),
      });

      const data = await response.json();

      results.push({
        topic: webhook.topic,
        success: response.ok,
        data,
      });
    }

    return results;
  } catch (error) {
    console.error("Error adding webhooks:", error);
    return { success: false, error: error.message };
  }
};

const addApiKey = async (session, apikey, plane_status) => {
  try {
    // Check if the domain already exists in the apikey table
    const [existing] = await db_con.promise().query(
      `SELECT * FROM apikey WHERE domain = ?`,
      [session.shop]
    );

    if (existing.length > 0) {
      // If domain exists, update the active status of the old record to 0
      await db_con.promise().query(
        `UPDATE apikey SET active = 0 WHERE domain = ?`,
        [session.shop]
      );
    }

    // Insert the new API key with active set to 1
    const insertQuery = `
      INSERT INTO apikey (
        domain, api_key, active, plane
      ) VALUES (?, ?, ?, ?)
    `;

    await db_con.promise().query(insertQuery, [
      session.shop,
      apikey,
      1, // active = 1 for the new entry
      plane_status,
    ]);
  } catch (error) {
    console.error("Error inserting API key:", error.message);
    throw new Error("Failed to insert or update API key in the database.");
  }
};

// Function to check if a store already exists in the database
const checkStoreAlreadyExist = async (shop, plane_status) => {
  try {
    const query = "SELECT * FROM userdetails WHERE shop = ? AND plane_status = ? AND active = 1";
    const [results] = await db_con.promise().query(query, [shop, plane_status]);
    return results.length > 0; // Returns true if store exists
  } catch (error) {
    console.error("Error checking if store exists:", error);
    throw new Error("Database error");
  }
};

// Helper function to initialize the store info
const initializeStoreInfo = async (plane_status, session) => {
  try {
    const sessionData = await session;
    const freePlanStatus = plane_status !== "Free"; // True if not Free

    const storeDetail = await Helper.storeInfo(sessionData);
    const requestBody = {
      name: sessionData.shop,
      shopUrl: `https://${sessionData.shop}`,
      ecommerce_type: "Wine", // Update this to match the required value, or replace it with a dynamic one
      email: storeDetail.shop.id ?? "", // Assuming `storeDetail.shop.id` is the email, adjust if necessary
      languages: "FR, EN", // Languages hardcoded as per your desired format
      subscription: plane_status, // Assuming plane_status contains values like 'free'
      free_play: freePlanStatus, // Fixed spelling as 'free_play'
      // accessToken: sessionData.accessToken, // Waiting for client
    };

    const apiUrl = `${process.env.API_URL}shopify/init_shop/`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": process.env.API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();

    if (responseData.status === "success") {
      console.log("responseData:", responseData);

      await addApiKey(sessionData, responseData.api_key); // Save the API key

      return responseData;
    } else {
      throw new Error(`Failed to initialize store info: ${responseData.message}`);
    }
  } catch (error) {
    console.error("Error in initializeStoreInfo:", error.message);
    throw new Error(`Error during store initialization: ${error.message}`);
  }
};

// UserController method to store user store info
UserController.storeUserStoreInfo = async (req, res) => {
  try {
    const shopId = res.locals.shopify.session.shop;
    console.log("shopId:", shopId);

    const session = res.locals.shopify.session;
    console.log("session:", session);

    const plane_status = req.body.plane_status;

    const storeExists = await checkStoreAlreadyExist(shopId, plane_status);

    // Deactivate previous stores if they exist
    if (!storeExists) {
      await deactivatePreviousStores(shopId);
    }

    // Insert or update user store info
    await insertUserStoreInfo(shopId, session, plane_status);

    // Add webhooks for the store
    const webhookResults = await addWebhooks(session);

    // Optionally initialize the store info externally
    const externalStoreInfo = await initializeStoreInfo(plane_status, session);

    res.status(201).json({
      status: 201,
      addWebhooks: webhookResults,
      insertUserStoreInfo: 'User store info inserted successfully',
      externalStoreInfo,
    });
  } catch (error) {
    console.error("Error in storeUserStoreInfo:", error.message);
    res.status(500).json({
      message: "An error occurred while storing user store info.",
      details: error.message,
    });
  }
};

// Helper function to deactivate previous stores for a shopId
const deactivatePreviousStores = async (shopId) => {
  try {
    const query = "UPDATE userdetails SET active = 0 WHERE shop_id = ?";
    await db_con.promise().query(query, [shopId]);
  } catch (error) {
    console.error("Error deactivating previous stores:", error);
    throw new Error("Error deactivating previous stores");
  }
};

// Helper function to insert user store info into the database
const insertUserStoreInfo = async (shopId, session, plane_status) => {
  try {
    const { id, shop, state, isOnline, scope, expires, accessToken, onlineAccessInfo } = session;

    const insertQuery = `
      INSERT INTO userdetails (
        shop_id, shop, state, isOnline, scope, expires, 
        accessToken, onlineAccessInfo, plane_status, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db_con.promise().query(insertQuery, [
      shopId, shop, state, isOnline, JSON.stringify(scope), expires ?? null, accessToken, onlineAccessInfo ?? null, plane_status, 1
    ]);
  } catch (error) {
    console.error("Error inserting session data into the database:", error);
    throw new Error("Database error");
  }
};

UserController.getStoreInfo = async (req, res) => {
  try {

    console.log("sukh");
    const { domain } = req.body; // Destructuring to make it more readable

    if (!domain) {
      return res.status(400).json({
        status: 400,
        message: "Missing parameter: domain."
      });
    }

    const query = "SELECT * FROM apikey WHERE domain = ? AND active = 1";
    const [results] = await db_con.promise().query(query, [domain ]);


    if (!results) {
      return res.status(404).json({
        status: 404,
        message: "Store not found or inactive."
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Store information retrieved successfully.",
      data: results
    });

  } catch (error) {
    console.error("Error fetching store information:", error.message);

    // Returning a detailed error message for debugging
    return res.status(500).json({
      status: 500,
      message: "Internal server error. Please try again later.",
      error: error.message
    });
  }
};

// UserController method to check if the shop exists and is active
UserController.checkShop = async (req, res) => {
  try {
    const shopId = res.locals.shopify.session.shop;
    const query = "SELECT * FROM userdetails WHERE shop = ? AND active = 1";

    const [results] = await db_con.promise().query(query, [shopId]);

    if (results.length > 0) {
      return res.status(200).json({ status: 1, message: 'Shop is active' });
    } else {
      return res.status(404).json({ message: 'Shop not found or inactive' });
    }
  } catch (error) {
    console.error("Error checking shop status:", error);
    return res.status(500).json({ message: 'Unexpected error occurred' });
  }
};
// UserController method to fetch active plan information for a shop
UserController.activePlane = async (req, res) => {
  try {
    const shop = res.locals.shopify.session.shop;

    if (!shop) {
      return res.status(400).json({ message: "Invalid session data." });
    }

    const query = `
      SELECT plane_status 
      FROM userdetails 
      WHERE shop = ? 
        AND active = 1 
        AND expired_at > NOW() 
      ORDER BY created_at DESC 
      LIMIT 1;
    `;

    db_con.query(query, [shop], (error, results) => {
      if (error) {
        return res.status(500).json({ message: "Database query error" });
      }

      if (results.length > 0) {
        return res.status(200).json({
          status: 200,
          data: results[0],
        });
      } else {
        return res.status(404).json({ message: "No active plan found for the store" });
      }
    });
  } catch (error) {
    console.error("Error in activePlane:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

UserController.storeBoatInfo = async (req, res) => {
  try {
    console.log("Incoming Request Body:", req.body);
    // const shopId = res.locals.shopify.session.shop;
    const shopId = "https://example.com";  // Replace this with your actual shopId

    // Extract data from the request body
    const {
      language,
      ecommerce_type,
      tone_of_voice,
      colour,
      initial_message,  // Corrected typo here
      subscription,
    } = req.body;

    // Validate required fields (simple validation for required fields)
    if (!language || !ecommerce_type || !tone_of_voice || !colour || !initial_message || !subscription) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if the shopId already exists in the database
    const checkQuery = `SELECT * FROM boatinfo WHERE shopUrl = ?`;
    const [existingStore] = await db_con.promise().query(checkQuery, [shopId]);

    // If the shopId exists, update the record
    if (existingStore.length > 0) {
      const updateQuery = `
        UPDATE  boatinfo SET
          language = ?,
          ecommerce_type = ?,
          tone_of_voice = ?,
          colour = ?,
          inital_message = ?,
          subscription = ?
        WHERE shopUrl = ?
      `;

      // Perform the update operation
      await db_con.promise().query(updateQuery, [
        JSON.stringify(language),
        ecommerce_type,
        tone_of_voice,
        colour,
        JSON.stringify(initial_message),
        subscription,
        shopId, // The identifier for the store
      ]);

      // Send a success response for update
      res.status(200).json({
        message: "Boat store info updated successfully.",
      });

    } else {
      // If the shopId does not exist, insert a new record
      const insertQuery = `
        INSERT INTO  boatinfo (
          shopUrl,
          language,
          ecommerce_type,
          tone_of_voice,
          colour,
          inital_message,
          subscription
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      // Perform the insert operation
      await db_con.promise().query(insertQuery, [
        shopId,
        JSON.stringify(language),
        ecommerce_type,
        tone_of_voice,
        colour,
        JSON.stringify(initial_message), // Store initial_message as a JSON string
        subscription,
      ]);

      // Send a success response for insert
      res.status(201).json({
        message: "Boat store info inserted successfully.",
      });
    }

  } catch (error) {
    console.error("Error in storeBoatInfo:", error.message);
    res.status(500).json({ message: "Failed to insert or update boat store info.", error: error.message });
  }
};


// Function to upload logo to Shopify
const uploadLogoToShopify = async (logoPath,session) => {
  try {
    // Read th
    const shopifyUrl = `https://${session.shop}/admin/api/2024-01/files.json`;  // Replace with your shop URL
    const accessToken = session.accessToken; 
 // Replace with your access tokene image file as a buffer
    const imageBuffer = fs.readFileSync(logoPath);
    const base64Image = imageBuffer.toString('base64');
    
    // Prepare the payload to send to Shopify
    const data = {
      file: {
        attachment: base64Image,
        filename: 'logo.png',  // Change filename if needed
        content_type: 'image/png'  // Ensure the content type matches the image type
      }
    };

    // Make the POST request to upload the file
    const response = await axios.post(shopifyUrl, data, {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
    });

    // Return the URL of the uploaded logo
    const logoUrl = response.data.file.url;  // This gives the URL of the uploaded image

    console.log('Logo uploaded successfully. Logo URL:', logoUrl);
    return logoUrl;  // Return the URL of the uploaded logo
  } catch (error) {
    console.error('Error uploading logo:', error.message);
    throw new Error('Failed to upload logo to Shopify');
  }
};


UserController.getBoatInfoByDomain = async (req, res) => {
  try {
    console.log("Incoming Request Body:", req.body);
    
    // Get the domain name from the request (assuming it's in the request body)
    const { shopUrl } = req.body; // You can also use req.params if it's in the URL
    
    if (!shopUrl) {
      return res.status(400).json({ message: "Domain name (shopUrl) is required." });
    }

    // Query to retrieve boat store info based on the provided domain (shopUrl)
    const query = `SELECT * FROM boatinfo WHERE shopUrl = ?`;

    const [result] = await db_con.promise().query(query, [shopUrl]);

    if (result.length === 0) {
      return res.status(404).json({ message: "Boat store info not found for the given domain." });
    }

    // Send the boat store info in the response
    res.status(200).json({
      message: "Boat store info retrieved successfully.",
      data: result[0], // Assuming you want to return the first matching record
    });

  } catch (error) {
    console.error("Error in getBoatInfoByDomain:", error.message);
    res.status(500).json({ message: "Failed to retrieve boat store info.", error: error.message });
  }
};


export default UserController;
