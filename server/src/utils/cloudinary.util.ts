import  cloudinary from "../config/cloudinary.config";
import streamifier from "streamifier";

// Upload image to Cloudinary
export const uploadImageToCloudinary = (
  fileBuffer: Buffer,
  folder: string = "images"
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        format: "webp",
        transformation: [{ width: 800, height: 800, crop: "limit" }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// Upload PDF to Cloudinary
export const uploadPdfToCloudinary = (
  fileBuffer: Buffer,
  filename: string,
  folder: string = "resumes"
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "raw",
        public_id: `${Date.now()}-${filename.replace(/\.[^/.]+$/, "")}`,
        format: "pdf",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// Upload audio to Cloudinary
export const uploadAudioToCloudinary = (
  fileBuffer: Buffer,
  filename: string,
  folder: string = "audio"
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "video", // Cloudinary uses 'video' for audio
        public_id: `${Date.now()}-${filename.replace(/\.[^/.]+$/, "")}`,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// Delete file from Cloudinary
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<any> => {
  return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};