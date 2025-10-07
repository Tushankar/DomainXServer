import express from "express";
import {
  getAllContent,
  updateContent,
  updateSection,
  getSection,
  resetContent,
} from "../controllers/contentController.js";

const router = express.Router();

// Main routes
router.route("/").get(getAllContent).put(updateContent);

// Reset route
router.post("/reset", resetContent);

// Section-specific routes
router.route("/:section").get(getSection).put(updateSection);

export default router;
