// middleware/upload.js
// TEMPLATE structure - change ALLOWED_TYPES and MAX_SIZE per project

const multer = require("multer");

// ─────────────────────────────────────────────────────
// Memory storage: file goes to req.file.buffer
// Use this when uploading to Cloudinary
// because Cloudinary needs the buffer, not a disk path
// ─────────────────────────────────────────────────────
const storage = multer.memoryStorage();

// ─────────────────────────────────────────────────────
// CHANGE THESE PER PROJECT
// ─────────────────────────────────────────────────────
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 5MB - change as needed

//Remove filFilter completely to allow all file types
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  // no fileFilter = all types accepted
});

module.exports = upload;