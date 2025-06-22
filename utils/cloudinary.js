import {v2 as cloudinary} from 'cloudinary';
import { response } from 'express';
import fs from "fs"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary= async(localFilePath)=>{               //for uploading a given file on cloudinary

      try{
        if(!localFilePath) return null;         
       const response= await cloudinary.uploader.upload(localFilePath,    
           {
             resource_type: "auto"
           })
      .then(console.log("file uploaded successfully ",response.url));
      return response
      }
      catch(error){
        fs.unlinkSync(localFilePath)  // removes the locally saved file 
        return null;
        }
}

