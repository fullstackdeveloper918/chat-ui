import db_con from "../db.js";
import axios from "axios";
import Helper, { getSessionData } from "../helper/helper.js";

// Controller for product-related actions
const botconfig = {};

// Function to add a product entry to the database
const addProductEntry = async (productData) => {
  try {
    const { shop_id, product_types, tone_of_voice, color_scheme } = productData;

    // SQL query to insert product details into the database
    const insertQuery = `
      INSERT INTO product_details (
        shop_id, product_types, tone_of_voice, color_scheme, created_at, updated_at
      ) VALUES (?, ?, ?, ?, NOW(), NOW())
    `;

    await db_con.promise().query(insertQuery, [
      shop_id, product_types, tone_of_voice, color_scheme
    ]);

    console.log("Product entry added successfully");
  } catch (error) {
    console.error("Error adding product entry:", error);
    throw new Error("Database error");
  }
};

// Controller method to handle storing product information
botconfig.storeProductInfo = async (req, res) => {
  try {
    const { shop_id, product_types, tone_of_voice, color_scheme } = req.body;

    // Check if the shop exists and if it's active
    const storeExists = await checkStoreAlreadyExist(shop_id);

    if (!storeExists) {
      return res.status(404).json({ message: 'Shop not found or inactive' });
    }

    // Insert the product details into the database
    await addProductEntry({
      shop_id, product_types, tone_of_voice, color_scheme
    });

    res.status(201).json({
      status: 201,
      message: 'Product entry added successfully',
    });
  } catch (error) {
    console.error("Error in storeProductInfo:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Function to check if a store already exists in the database
const checkStoreAlreadyExist = async (shop_id) => {
  try {
    const query = "SELECT * FROM userdetails WHERE shop_id = ? AND active = 1";
    const [results] = await db_con.promise().query(query, [shop_id]);
    return results.length > 0; // Returns true if store exists
  } catch (error) {
    console.error("Error checking if store exists:", error);
    throw new Error("Database error");
  }
};

export default botconfig;
