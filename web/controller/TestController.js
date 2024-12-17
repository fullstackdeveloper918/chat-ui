import db_con from "../db.js";
import  axios from "axios";

const TESTCONTROLLER  = {};

TESTCONTROLLER.checkWebhook = async (req, res) => {
    try {
        console.log("Webhook testing", req.body);
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
};




export default TESTCONTROLLER



