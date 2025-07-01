import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.error("❌ No local file path provided to Cloudinary.");
      return null;
    }

    // 👇 Confirm file exists
    if (!fs.existsSync(localFilePath)) {
      console.error("❌ File does not exist at path:", localFilePath);
      return null;
    }

    console.log("📤 Uploading file to Cloudinary:", localFilePath);

    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    });

    console.log("✅ File uploaded to Cloudinary:", result.url);

    fs.unlinkSync(localFilePath);
    return result;

  } catch (error) {
    console.error("❌ Cloudinary upload failed with error:", error);
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloudinary };
