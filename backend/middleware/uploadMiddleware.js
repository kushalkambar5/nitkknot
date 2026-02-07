import multer from "multer";

// Use memory storage to access file buffers
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpeg, .jpg, .png and .webp formats allowed!"), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max size per file
    files: 6, // Max 6 files
    fieldSize: 10 * 1024 * 1024, // 10MB limit for text fields (Base64 strings)
  },
});

export default upload;
