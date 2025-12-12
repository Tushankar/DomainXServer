import express from "express";
import * as purchaseController from "../controllers/purchaseController.js";

const router = express.Router();

/**
 * Wishlist Routes
 */

/**
 * @route   POST /api/wishlist/add
 * @desc    Add domain to wishlist
 * @access  Public (with buyerId in body or auth token)
 * @body    { domain, sld, tld, appraised_value, appraised_wholesale_value, appraisalData, notes }
 */
router.post("/add", purchaseController.addToWishlist);

/**
 * @route   GET /api/wishlist
 * @desc    Get user's wishlist
 * @access  Public (with buyerId in body or auth token)
 */
router.get("/", purchaseController.getWishlist);

/**
 * @route   DELETE /api/wishlist/:domain
 * @desc    Remove domain from wishlist
 * @access  Public (with buyerId in body or auth token)
 */
router.delete("/:domain", purchaseController.removeFromWishlist);

/**
 * @route   GET /api/wishlist/check/:domain
 * @desc    Check if domain is in wishlist
 * @access  Public (with buyerId in body or auth token)
 */
router.get("/check/:domain", purchaseController.isInWishlist);

/**
 * Purchase Routes
 */

/**
 * Admin Price Approval Routes - Must come before :purchaseId route
 */

/**
 * @route   GET /api/purchases/approvals/pending
 * @desc    Get all pending price approvals (Admin Only)
 * @access  Admin
 */
router.get("/approvals/pending", purchaseController.getPendingPriceApprovals);

/**
 * @route   POST /api/purchases/approvals/:purchaseId/approve
 * @desc    Approve domain price (Admin Only)
 * @access  Admin
 * @body    { approvedPrice, adminNotes }
 */
router.post(
  "/approvals/:purchaseId/approve",
  purchaseController.approveDomainPrice
);

/**
 * @route   POST /api/purchases/approvals/:purchaseId/reject
 * @desc    Reject domain price (Admin Only)
 * @access  Admin
 * @body    { rejectionReason }
 */
router.post(
  "/approvals/:purchaseId/reject",
  purchaseController.rejectDomainPrice
);

/**
 * @route   GET /api/purchases/approved/list
 * @desc    Get approved domains for buyer
 * @access  Public (with buyerId in body or auth token)
 */
router.get("/approved/list", purchaseController.getApprovedDomains);

/**
 * @route   GET /api/purchases
 * @desc    Get user's purchases
 * @access  Public (with buyerId in body or auth token)
 */
router.get("/", purchaseController.getPurchases);

/**
 * @route   GET /api/purchases/:purchaseId
 * @desc    Get purchase details
 * @access  Public (with buyerId in body or auth token)
 */
router.get("/:purchaseId", purchaseController.getPurchaseDetails);

export default router;
