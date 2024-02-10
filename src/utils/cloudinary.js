import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(
      localFilePath,
      { public_id: "olympic_flag", resource_type: "auto" }
    );

    console.log("The file has been uploaded to Server! ",response.url)
  } catch (e) {
    fs.unlinkSync(localFilePath); // remove un uploaded file
    return null;    
  }
};


export {uploadOnCloudinary};