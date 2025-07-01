// import mongoose from "mongoose"
// import { DB_NAME } from "./constant.js"
// import express from "express"

// ✅ ALWAYS FIRST
import dotenv from "dotenv";
dotenv.config({ path: './.env' }); // ✅ Load .env FIRST

// Now import the rest
import connectDB from "../db/index.js";
import { app } from "./app.js";

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    });
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
});

console.log("🌐 Cloudinary config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
});

// const app= express()

// (async ()=>{
//     try {
//         mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//         app.on("ERROR",(error)=>{
//             console.log("ERRR: ",error);
//             throw error
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log(`SERVER IS RUNNING ON PORT ${process.env.PORT}`)
//         })
//     }
//     catch(error){
//         console.error("ERROR: ",error)
//         throw error
//     }
// })()