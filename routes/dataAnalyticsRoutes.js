import express from "express";
import {
  createAnalyticsSubmission,
  updateAnalyticsSubmission,
  getAllAnalyticsSubmissions,
  getAnalyticsSubmissionById,
  getAnalyticsSubmissionByEmail,
  deleteAnalyticsSubmission,
  getAnalyticsSummary,
  exportAnalyticsToCSV,
  recalculateCompletion,
} from "../controllers/dataAnalyticsController.js";
import { authenticateAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

// Public routes
router.post("/", createAnalyticsSubmission);
router.get("/email/:email", getAnalyticsSubmissionByEmail);
router.put("/:id", updateAnalyticsSubmission);

// Admin/Private routes - require authentication
router.use(authenticateAdmin);
router.get("/dashboard/summary", getAnalyticsSummary);
router.get("/export/csv", exportAnalyticsToCSV);
router.post("/recalculate-completion", recalculateCompletion);
router.get("/", getAllAnalyticsSubmissions);
router.get("/:id", getAnalyticsSubmissionById);
router.delete("/:id", deleteAnalyticsSubmission);

export default router;
