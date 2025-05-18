import { Request } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directories exist
const createDirIfNotExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Create upload directories
const uploadsDir = path.join(__dirname, "../../uploads");
const circleImagesDir = path.join(uploadsDir, "circles");
const postMediaDir = path.join(uploadsDir, "posts");
const profilePicsDir = path.join(uploadsDir, "profiles");
const messageMediaDir = path.join(uploadsDir, "messages");

createDirIfNotExists(uploadsDir);
createDirIfNotExists(circleImagesDir);
createDirIfNotExists(postMediaDir);
createDirIfNotExists(profilePicsDir);
createDirIfNotExists(messageMediaDir);

// Configure storage for different upload types
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // Check if it's a direct profile picture update
    if (req.path === "/profile/picture" || req.originalUrl.includes("/profile/picture")) {
      cb(null, profilePicsDir);
      return;
    }
    
    const uploadType = req.params.uploadType || "posts";

    switch (uploadType) {
      case "circles":
        cb(null, circleImagesDir);
        break;
      case "profiles":
        cb(null, profilePicsDir);
        break;
      case "messages":
        cb(null, messageMediaDir);
        break;
      case "posts":
      default:
        cb(null, postMediaDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    
    // Check if it's a profile picture upload
    if (req.path === "/profile/picture" || req.originalUrl.includes("/profile/picture")) {
      const userId = req.user && req.user._id ? req.user._id.toString() : "unknown";
      cb(null, `profile-${userId}-${uniqueSuffix}${ext}`);
      return;
    }
    
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// File filter to allow only images and videos
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Define allowed file types
  const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];

  // Check if the file type is allowed
  if (
    allowedImageTypes.includes(file.mimetype) ||
    allowedVideoTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "File type not supported. Please upload an image or video file."
      )
    );
  }
};

// Create multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
});

export const uploadSingle = (fieldName: string = "file") =>
  upload.single(fieldName);
export const uploadMultiple = (
  fieldName: string = "files",
  maxCount: number = 5
) => upload.array(fieldName, maxCount);

export default upload;
