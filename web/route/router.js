import express from "express";
import Helper from "../helper/helper.js";
const route = express.Router();
import USER from "../controller/UserController.js";

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

route.get("/check-shop-existence", USER.checkShop);



export default route;
