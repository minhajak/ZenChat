import multer from "multer";
import cloudinary from "../config/cloudinary.config";
import { Request } from "express";
import streamifier from "streamifier";

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (
	buffer: Buffer,
	options: any
): Promise<any> => {
	return new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			options,
			(error, result) => {
				if (error) reject(error);
				else resolve(result);
			}
		);
		streamifier.createReadStream(buffer).pipe(uploadStream);
	});
};

// Image Upload Configuration
const imageStorage = multer.memoryStorage();

export const imageUpload = multer({
	storage: imageStorage,
	fileFilter: (_req, file, cb) => {
		const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
		cb(null, allowedTypes.includes(file.mimetype));
	},
});

// Middleware to upload image to Cloudinary after multer processes it
export const uploadImageToCloudinary = async (
	req: Request,
	_res: any,
	next: Function
) => {
	try {
		if (!req.file) return next();

		const result = await uploadToCloudinary(req.file.buffer, {
			folder: "images",
			resource_type: "image",
			format: "webp",
			transformation: [{ width: 800, height: 800, crop: "limit" }],
		});

		// Attach Cloudinary result to req.file
		(req.file as any).cloudinary = result;
		(req.file as any).path = result.secure_url;

		next();
	} catch (error) {
		next(error);
	}
};

// PDF Upload Configuration
const pdfStorage = multer.memoryStorage();

const pdfFileFilter = (_req: any, file: Express.Multer.File, cb: Function) => {
	if (file.mimetype === "application/pdf") {
		cb(null, true);
	} else {
		cb(new Error("Only PDF files are allowed!"), false);
	}
};

export const pdfUpload = multer({
	storage: pdfStorage,
	fileFilter: pdfFileFilter,
});

// Middleware to upload PDF to Cloudinary
export const uploadPdfToCloudinary = async (
	req: Request,
	_res: any,
	next: Function
) => {
	try {
		if (!req.file) return next();

		const result = await uploadToCloudinary(req.file.buffer, {
			folder: "resumes",
			resource_type: "raw",
			public_id: `${Date.now()}-${req.file.originalname}`,
			type: "upload",
		});

		(req.file as any).cloudinary = result;
		(req.file as any).path = result.secure_url;

		next();
	} catch (error) {
		next(error);
	}
};

// Audio Upload Configuration
const audioStorage = multer.memoryStorage();

const audioFileFilter = (
	_req: any,
	file: Express.Multer.File,
	cb: Function
) => {
	const allowedTypes = [
		"audio/mpeg",
		"audio/wav",
		"audio/ogg",
		"audio/mp3",
		"audio/webm",
	];
	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error("Only audio files are allowed!"), false);
	}
};

export const audioUpload = multer({
	storage: audioStorage,
	fileFilter: audioFileFilter,
});

// Middleware to upload audio to Cloudinary
export const uploadAudioToCloudinary = async (
	req: Request,
	_res: any,
	next: Function
) => {
	try {
		if (!req.file) return next();

		const result = await uploadToCloudinary(req.file.buffer, {
			folder: "audio",
			resource_type: "video", // Cloudinary uses 'video' for audio files
			public_id: `${Date.now()}-${req.file.originalname}`,
		});

		(req.file as any).cloudinary = result;
		(req.file as any).path = result.secure_url;

		next();
	} catch (error) {
		next(error);
	}
};