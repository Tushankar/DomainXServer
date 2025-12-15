import express from "express";
import * as formSubmissionController from "../controllers/formSubmissionController.js";
import { authenticateAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

// Public routes
router.post("/submit", formSubmissionController.submitForm);

// Admin routes
router.use(authenticateAdmin); // Apply authentication to all routes below
router.get("/analytics", formSubmissionController.getAnalytics);
router.get("/all", formSubmissionController.getAllSubmissions);
router.get("/:id", formSubmissionController.getSubmissionById);
router.patch("/:id/status", formSubmissionController.updateSubmissionStatus);
router.delete("/:id", formSubmissionController.deleteSubmission);
router.get("/export/csv", formSubmissionController.exportSubmissionsToCSV);

export default router;
