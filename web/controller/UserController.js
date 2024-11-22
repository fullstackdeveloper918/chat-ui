import db_con from "../db.js";
import axios from "axios";

const UserController = {};

// Function to check if the store already exists in the database
// Function to check if the store already exists in the database
const checkStoreAlreadyExist = async (shop ,plane_status) => {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM userdetails WHERE shop = ? and plane_status";
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


// UserController method to store user store info
UserController.storeUserStoreInfo = async (req, res) => {
    try {
        const shopId = res.locals.shopify.session.shop; // Get the shop name from the request body
        console.log("shopId" ,shopId);
        const plane_status = req.body.plane_status; 
        
        // Check if the store already exists
        const storeExists = await checkStoreAlreadyExist(shopId ,plane_status);
        
        if (storeExists) {
            return res.status(400).json({ message: "Store already exists" });
        }
        
       // const plane_status = req.body.plane_status; // Get plane_status from request body
        console.log("Plane Status:", plane_status);

        const currentUserSession = res.locals.shopify.session; // Get Shopify session from locals
        console.log("currentUserSession123", currentUserSession);

        const { id, shop, state, isOnline, scope, expires, accessToken, onlineAccessInfo } = currentUserSession;
        const scopeValues = JSON.stringify(scope)

        // Handle 'expires' if undefined or null
        const expiresValue = expires == undefined || expires == null ? 'undefined' : expires;
        const onlineAccessInfovalue = onlineAccessInfo == undefined || onlineAccessInfo == null ? 'undefined' : onlineAccessInfo;

        // Prepare the query to insert the session info into the database
        const query = `
            INSERT INTO userdetails (
                shop_id, shop, state, isOnline, scope, expires, 
                accessToken, onlineAccessInfo, plane_status,active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        // Execute the query
        db_con.query(query, [
            shop, shop, state, isOnline, scopeValues, expiresValue, accessToken, onlineAccessInfovalue, plane_status,1,
        ], (error, results) => {
            if (error) {
                console.error("Error inserting session data into the database: ", error);
                return res.status(500).json({ message: "Database error" });
            }
            res.status(200).json({ message: "User session saved successfully", results });
        });

    } catch (error) {
        console.error("Error in storeUserStoreInfo: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};




export default UserController;
