import express from "express";
import Helper from "../helper/helper.js";
const route = express.Router();
import USER from "../controller/UserController.js";
import TEST from "../controller/TestController.js";
//import fileForge from 'express-fileforge';
//import path from  '../images';



route.post("/store-userinfo", USER.storeUserStoreInfo);
route.get("/apiendpoint-zoyia", async (req, res) => {
  const apiUrl = process.env.API_URL;
  const session = res.locals.shopify.session;

  const apiKey = await Helper.getShopInfo(session);
 // console.log("apiKey", apiKey);

  if (apiUrl) {
    return res.status(200).json({
      status: 200,
      data: {
        apiUrl: apiUrl,
        apiKey: apiKey,
      },
    });
  } else {
    return res.status(500).json({
      status: 500,
      error: "API_URL is not defined in the environment variables.",
    });
  }
});
route.get("/active-plane",USER.activePlane)


//route.post("/webhooktest",TEST.checkWebhook)
/* route.post("/created-product", async (req, res) => {
  try {
    // Extract the store domain from the headers
    const storeDomain = req.headers['x-shopify-shop-domain'];

    // You can now use the storeDomain to query your database or handle the webhook

    console.log("Webhook received from store:", storeDomain);
    console.log("Created product data:", req.body);

    return res.status(200).json({
        status: 200,
        message: "ok"
    });
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).json({
        status: 500,
        message: "Internal Server Error"
    });
  }
});
route.post("/delete-product", async (req, res) => {
  try {
    const storeDomain = req.headers['x-shopify-shop-domain'];
    console.log(storeDomain,"Webhook received from store:")
    console.log("delete-product", req.body);
    return res.status(200).json({
        status: 200,
        message: "ok"
    });
} catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).json({
        status: 500,
        message: "Internal Server Error"
    });
}
});
route.post("/updated-product", async (req, res) => {
  try {
    const storeDomain = req.headers['x-shopify-shop-domain'];
    console.log(storeDomain,"Webhook received from store:")

    console.log("updated-product", req.body);
    return res.status(200).json({
        status: 200,
        message: "ok"
    });
} catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).json({
        status: 500,
        message: "Internal Server Error"
    });
}
}); */





route.get("/getStore-info", USER.getStoreInfo);

route.post("/store-boat-info", USER.storeBoatInfo);


route.get("/store-boat-info", USER.getBoatInfoByDomain);


route.get("/check-shop-existence", USER.checkShop);




export default route;
