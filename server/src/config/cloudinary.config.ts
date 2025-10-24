import { v2 as cloudinary } from "cloudinary";
import { getEnvVariable } from "../utils/helper.util";

const cloud_name = getEnvVariable("CLOUDINARY_NAME");
const cloud_key = getEnvVariable("CLOUDINARY_API_KEY");
const cloud_secret = getEnvVariable("CLOUDINARY_API_SECRET");

cloudinary.config({
  cloud_name: cloud_name,
  api_key: cloud_key,
  api_secret: cloud_secret,
});
export default cloudinary;
