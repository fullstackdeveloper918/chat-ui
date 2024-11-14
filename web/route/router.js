import express from "express" ;
const route = express.Router();


route.get("/testing", (req,res)=>{
    console.log("hello");
    res.send("Hey hii")
});

route.get("/add-product", (req,res)=>{
    console.log(req.body);
    res.send("Hey hii");
})



export default route