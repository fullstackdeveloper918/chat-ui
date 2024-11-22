import express from "express" ;
const route = express.Router();

import USER from "../controller/UserController.js"

route.post('/store-userinfo',USER.storeUserStoreInfo)


route.get("/testing", (req,res)=>{
    const currentUserSession = res.locals.shopify.session;
    console.log("currentUserSession" ,currentUserSession);
})


route.get("/add-product", (req,res)=>{
    console.log(req.body);
    res.send("Hey hii");
})



export default route