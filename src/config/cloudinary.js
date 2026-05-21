import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tmpDir = path.join(__dirname, '../../tmp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tmpDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\\s+/g, '-')}`)
});

const multerUpload = multer({ storage });

export const upload = {
  single: (fieldName) => {
    return (req, res, next) => {
      multerUpload.single(fieldName)(req, res, async (err) => {
        if (err) return res.status(400).json({ success: false, message: err.message });
        if (!req.file) return next();

        try {
          const filePath = req.file.path;
          const sizeMB = req.file.size / (1024 * 1024);

          if (sizeMB > 8) {
            // Local Storage (> 8MB)
            const uploadsDir = path.join(__dirname, '../../uploads');
            if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
            
            const newPath = path.join(uploadsDir, req.file.filename);
            fs.renameSync(filePath, newPath);
            
            // Set path to the public URL so controllers save this string
            req.file.path = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            next();
          } else {
            // Cloudinary (<= 8MB)
            const result = await cloudinary.uploader.upload(filePath, { folder: 'hinguland' });
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            
            req.file.path = result.secure_url;
            req.file.filename = result.public_id; // For mediaController compatibility
            next();
          }
        } catch (error) {
          console.error("Upload error:", error);
          if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
          return res.status(500).json({ success: false, message: 'Upload failed: ' + error.message });
        }
      });
    };
  }
};

export default cloudinary;
