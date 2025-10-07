import express from "express";
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogStats,
} from "../controllers/blogController.js";
import { authenticateAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

// Public routes
router.get("/", getAllBlogs);
router.get("/stats", getBlogStats);
router.get("/:id", getBlogById);

// Protected routes (require admin authentication)
router.post("/", authenticateAdmin, createBlog);
router.put("/:id", authenticateAdmin, updateBlog);
router.delete("/:id", authenticateAdmin, deleteBlog);

export default router;
