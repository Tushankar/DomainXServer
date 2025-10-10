import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as formConfigController from '../controllers/formConfigController.js';
import { authenticateAdmin } from '../middleware/adminAuth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'backgrounds');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'bg-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Public route - Get active form configuration
router.get('/form-config', formConfigController.getFormConfig);

// Admin routes - Protected with authentication
router.post('/form-config', authenticateAdmin, formConfigController.saveFormConfig);

router.post(
  '/upload-background', 
  authenticateAdmin, 
  upload.single('image'), 
  formConfigController.uploadBackground
);

router.delete(
  '/background/:stepIndex', 
  authenticateAdmin, 
  formConfigController.deleteBackground
);

router.get(
  '/form-config/history', 
  authenticateAdmin, 
  formConfigController.getConfigHistory
);

export default router;
