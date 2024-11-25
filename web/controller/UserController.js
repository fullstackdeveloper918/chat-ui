import db_con from "../db.js";
import axios from "axios";
import Helper, { getSessionData } from "../helper/helper.js";

// Controller for user-related actions
const UserController = {};

// Function to check if the store already exists in the database
const checkStoreAlreadyExist = async (shop, plane_status) => {
  try {
    const query = "SELECT * FROM userdetails WHERE shop = ? AND plane_status = ? AND active = 1";
    const [results] = await db_con.promise().query(query, [shop, plane_status]);
    return results.length > 0; // Returns true if store exists
  } catch (error) {
    console.error("Error checking if store exists: ", error);
    throw new Error("Database error");
  }
};

// Helper function to initialize the store info
const zoiya_storeUserStoreInfo = async (plane_status, session) => {
  try {
    const sessionData = await session;
    const supportedLanguages = await Helper.getStoreLanguages(sessionData);
    const freePlanStatus = plane_status !== "Free"; // True if not Free

    const storeDetail = await Helper.storeInfo(sessionData);
    const requestBody = {
      name: sessionData.shop,
      shopUrl: `https://${sessionData.shop}`,
      ecommerceType: "Shopify",
      email: storeDetail.shop.id ?? "", // Placeholder for email
      languages: supportedLanguages,
      subscription: plane_status,
      free_plan: freePlanStatus,
      start_date: new Date().toISOString().split('T')[0],
      access_token: sessionData.accessToken,
    };

    const baseUrl = process.env.API_URL;
    const apiUrl = `${baseUrl}/shopify/init_shop`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Key": process.env.API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();
    if (responseData.status === "success") {
      console.log("Shop initialized successfully:", responseData.message);
      return responseData;
    } else {
      console.error("Error initializing shop:", responseData.message);
      throw new Error(responseData.message);
    }
  } catch (error) {
    console.error("Error in zoiya_storeUserStoreInfo:", error.message);
    throw error;
  }
};
// UserController method to store user store info
UserController.storeUserStoreInfo = async (req, res) => {
  try {
    const shopId = res.locals.shopify.session.shop;
    console.log("checking shop",shopId);
    const session = res.locals.shopify.session;
    const plane_status = req.body.plane_status;

    const storeExists = await checkStoreAlreadyExist(shopId, plane_status);
    if (!storeExists) {
      await deactivatePreviousStores(shopId);
    }

    // Insert or update user store info in the database
    await insertUserStoreInfo(shopId, session, plane_status);

    // Optionally, call the zoiya_storeUserStoreInfo function for external store initialization
    await zoiya_storeUserStoreInfo(plane_status, session);

    res.status(200).json({ message: "User session saved successfully" });
  } catch (error) {
    console.error("Error in storeUserStoreInfo:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Helper function to deactivate all previous stores for a shopId
const deactivatePreviousStores = async (shopId) => {
  try {
    const deactivateQuery = "UPDATE userdetails SET active = 0 WHERE shop_id = ?";
    await db_con.promise().query(deactivateQuery, [shopId]);
    console.log("All previous stores deactivated successfully");
  } catch (error) {
    console.error("Error deactivating previous stores:", error);
    throw new Error("Error deactivating previous stores");
  }
};

// Helper function to insert user store info into the database
const insertUserStoreInfo = async (shopId, session, plane_status) => {
  try {
    const { id, shop, state, isOnline, scope, expires, accessToken, onlineAccessInfo } = session;

    const scopeValues = JSON.stringify(scope);
    const expiresValue = expires ?? null; // If expires is undefined or null, set to null
    const onlineAccessInfoValue = onlineAccessInfo ?? null;

    const insertQuery = `
      INSERT INTO userdetails (
        shop_id, shop, state, isOnline, scope, expires, 
        accessToken, onlineAccessInfo, plane_status, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db_con.promise().query(insertQuery, [
      shopId, shop, state, isOnline, scopeValues, expiresValue, accessToken, onlineAccessInfoValue, plane_status, 1
    ]);

    console.log("User store info inserted successfully");
  } catch (error) {
    console.error("Error inserting session data into the database:", error);
    throw new Error("Database error");
  }
};

// UserController method to check if the shop exists and is active
UserController.checkShop = async (req, res) => {
  try {
    const shopId = res.locals.shopify.session.shop;
    const query = "SELECT * FROM userdetails WHERE shop = ? AND active = 1";
    
    const [results] = await db_con.promise().query(query, [shopId]);
    
    if (results.length > 0) {
      return res.status(200).json({ status: 1, message: 'Shop is active'});
    } else {
      return res.status(404).json({ message: 'Shop not found or inactive' });
    }
  } catch (error) {
    console.error("Error checking shop status:", error);
    return res.status(500).json({ message: 'Unexpected error occurred' });
  }
};

UserController.activePlane = async (req, res) => {
  try {
    // Destructure the session data for shop (already available in res.locals.shopify.session)
    const shop = res.locals.shopify.session.shop;
    
    // Ensure session data is valid
    if (!shop) {
      return res.status(400).json({ message: "Invalid session data." });
    }

    // SQL query to fetch the active plan with conditions
    const query = `
      SELECT plane_status 
      FROM userdetails 
      WHERE shop = ? 
        AND active = 1 
        AND expired_at > NOW() 
      ORDER BY created_at DESC 
      LIMIT 1;
    `;

    // Execute the query with the shop as the parameter
    db_con.query(query, [shop], (error, results) => {
      if (error) {
        console.error("Error executing query: ", error);
        return res.status(500).json({ message: "Database query error" });
      }

      // Check if results exist
      if (results.length > 0) {
        // Return the active plan with a success status
        return res.status(200).json({
          status: 200,
          data: results[0],  // Return the first active plan result
        });
      } else {
        // If no active plan found, return an appropriate message
        return res.status(404).json({
          message: "No active plan found for the store",
        });
      }
    });
  } catch (error) {
    // Log the error and respond with 500 if any error occurs
    console.error("Error in activePlane:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};




export default UserController;
