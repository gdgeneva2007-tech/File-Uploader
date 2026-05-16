// utils/cloudinaryUpload.js
// TEMPLATE: the Promise wrapper never changes
// Only change: folder name per project

const cloudinary = require("../config/cloudinary");

// Detect what resource_type Cloudinary needs
// based on the file's mimetype
function getResourceType(mimetype){
  if(mimetype.startsWith("image/"))return "image"
  if(mimetype.startsWith("video/"))return "video"
  // everything else (pdf, txt, html, zip, etc)="raw"
  return "raw"
}



// ─────────────────────────────────────────────────────
// Upload a file buffer to Cloudinary
//
// Parameters:
//   buffer      → req.file.buffer from multer
//   folder      → cloudinary folder name (change per project)
//   resourceType → "image", "video", or "auto"
//
// Returns: the full Cloudinary result object
//   result.secure_url → the URL to save in database
//   result.public_id  → needed later to delete the file
//   result.bytes      → file size
//   result.format     → file extension
// ─────────────────────────────────────────────────────
const uploadToCloudinary = (buffer, folder = "uploads", mimetype="") => {
  // Cloudinary's upload_stream uses callbacks not async/await
  // We wrap it in a Promise so we can use async/await in controllers
  const resourceType=getResourceType(mimetype)
                                    // detect from mimetype
  
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType
        //"image": for images
        //"video": for videos
        //"raw": for everything else
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    // send the buffer into the stream
    stream.end(buffer);
  });
};

// ─────────────────────────────────────────────────────
// Delete a file from Cloudinary by its public_id
//
// Parameters:
//   publicId → the public_id saved in your database
// ─────────────────────────────────────────────────────
const deleteFromCloudinary = async (publicId) => {
  return await cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };