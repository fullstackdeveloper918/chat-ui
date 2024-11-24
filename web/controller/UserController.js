import db_con from "../db.js";
import axios from "axios";
import Helper, { getSessionData } from "../helper/helper.js";

const UserController = {};


/* Function to check if the store already exists in the database */
const checkStoreAlreadyExist = async (shop ,plane_status) => {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM userdetails WHERE shop = ? and plane_status and active = 1";
        db_con.query(query, [shop,plane_status], (error, results) => {
            if (error) {
                console.error("Error checking if store exists: ", error);
                reject(new Error("Database error"));
            }
            // If store exists, return true, otherwise false
            if (results.length > 0) {
                resolve(true); // Store exists
            } else {
                resolve(false); // Store does not exist
            }
        });
    });
};

const zoiya_storeUserStoreInfo = async (plane_status , session) => {
    try {
      // Fetch session data (e.g., access token and shop URL)
      const sessionData = await session
      //console.log("sessionData",sessionData)  ;  
      // Fetch supported languages using Helper
      const supportedLanguages = await Helper.getStoreLanguages(sessionData);
      //console.log("Supported languages:", supportedLanguages);
      let free_plan_status = true
      if(plane_status != "Free"){
        free_plan_status = false
      }
      free_plan: false
      // Prepare the payload for the /shopify/init_shop/ API
      const requestBody = {
        name: sessionData.shop,  // Assuming shop name is part of session data
        shopUrl: `https://${sessionData.shop}`,
        ecommerceType: "Shopify",
        email: "test@gmail.com",  // Assuming email is part of session data
        languages: supportedLanguages,
        subscription: plane_status,  // You can dynamically adjust this based on your logic
        free_plan: free_plan_status,  // You can dynamically adjust this as well
        start_date: new Date().toISOString().split('T')[0],  // Gets the current date in "YYYY-MM-DD" format
        access_token: sessionData.accessToken,  // The Shopify access token
      };

      //console.log("JSON.stringify(requestBody)",JSON.stringify(requestBody))
      //return res.status(400).json({ message: "Store already exists" }); 
      
      // Call the /shopify/init_shop/ API endpoint
      const baseUrl = process.env.API_URL; // Get base URL from environment variable
      const apiUrl = `${baseUrl}/shopify/init_shop`; // Use template literals to construct the API URL
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "API-Key":  process.env.API_KEY ,  // Add actual API key if required
        },
        body: JSON.stringify(requestBody),
      });
  
      // Handle the response from the API
      const responseData = await response.json();
      if (responseData.status === "success") {
        console.log("Shop initialized successfully:", responseData.message);
        return responseData;  // Return success response if needed
      } else {
        console.error("Error initializing shop:", responseData.message);
        throw new Error(responseData.message);  // Throw an error if initialization failed
      }
  
    } catch (error) {
      console.error("Error in zoiya_storeUserStoreInfo:", error.message);
      throw error;  // Propagate the error if needed
    }
};
  
/*UserController method to store user store info  */
UserController.storeUserStoreInfo = async (req, res) => {
  try {
      const shopId = res.locals.shopify.session.shop;
      const session = res.locals.shopify.session;

      const plane_status = req.body.plane_status; // Get plane_status from request body

      const storezoiyastoreUserStoreInfo = zoiya_storeUserStoreInfo(plane_status, session);

      // Check if the store already exists with the same shopId and plane_status
      const storeExists = await checkStoreAlreadyExist(shopId, plane_status);
      
      if (!storeExists) {
          // No store exists, so deactivate all records for this shopId first
          const deactivateQuery = `
              UPDATE userdetails
              SET active = 0
              WHERE shop_id = ?
          `;
          db_con.query(deactivateQuery, [shopId], (deactivateError, deactivateResults) => {
              if (deactivateError) {
                  console.error("Error deactivating previous stores: ", deactivateError);
                  return res.status(500).json({ message: "Error deactivating previous stores" });
              }

              console.log("All previous stores deactivated successfully");
          });
      }

      const currentUserSession = res.locals.shopify.session; // Get Shopify session from locals
      const { id, shop, state, isOnline, scope, expires, accessToken, onlineAccessInfo } = currentUserSession;

      const scopeValues = JSON.stringify(scope);
      
      // Handle 'expires' and 'onlineAccessInfo' as null if undefined
      const expiresValue = expires == undefined || expires == null ? null : expires;
      const onlineAccessInfovalue = onlineAccessInfo == undefined || onlineAccessInfo == null ? null : onlineAccessInfo;

      // Prepare the query to insert the session info into the database
      const insertQuery = `
          INSERT INTO userdetails (
              shop_id, shop, state, isOnline, scope, expires, 
              accessToken, onlineAccessInfo, plane_status, active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      // Execute the query to insert new row with active = 1
      db_con.query(insertQuery, [
          shopId, shop, state, isOnline, scopeValues, expiresValue, accessToken, onlineAccessInfovalue, plane_status, 1,
      ], (insertError, insertResults) => {
          if (insertError) {
              console.error("Error inserting session data into the database: ", insertError);
              return res.status(500).json({ message: "Database error" });
          }
          res.status(200).json({ message: "User session saved successfully", results: insertResults });
      });

  } catch (error) {
      console.error("Error in storeUserStoreInfo: ", error);
      res.status(500).json({ message: "Internal server error" });
  }
};

UserController.checkShop = async (req, res) => {
  console.log('abh');
  const shopId = res.locals.shopify.session.shop;
  console.log(shopId, 'shop');
  const Aapikey = process.env.API_URL;

  try {
    const query = "SELECT * FROM userdetails WHERE shop = ? AND active = 1";

    
    // Assuming db_con.query returns a Promise, otherwise you might need to promisify the query.
    db_con.query(query, [shopId], (error, results) => {
      if (error) {
        console.error("Error checking if store exists: ", error);
        return res.status(500).json({ message: 'Database error' });
      }


      console.log("results", results);
      
      // Send response based on the query result
      if (results.length > 0) {
        return res.status(200).json({status: 1, message: 'Shop is active'});
      } else {
        return res.status(404).json({ message: 'Shop not found or inactive' });
      }
    });
  } catch (err) {
    console.error("Unexpected error: ", err);
    return res.status(500).json({ message: 'Unexpected error occurred' });
  }
};














export default UserController;
