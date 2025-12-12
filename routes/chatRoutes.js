import express from "express";
import * as chatController from "../controllers/chatController.js";
import { authenticateBuyer } from "../middleware/buyerAuth.js";
import { authenticateReseller } from "../middleware/resellerAuth.js";

const router = express.Router();

/**
 * @route   POST /api/chat/send
 * @desc    Send a message in a conversation
 * @access  Private (Buyer)
 */
router.post("/send", authenticateBuyer, chatController.sendMessage);

/**
 * @route   GET /api/chat/conversation/:domainId
 * @desc    Get conversation for a specific domain
 * @access  Private (Buyer)
 */
router.get(
  "/conversation/:domainId",
  authenticateBuyer,
  chatController.getConversation
);

/**
 * @route   PUT /api/chat/read/:conversationId
 * @desc    Mark messages as read
 * @access  Private (Buyer)
 */
router.put("/read/:conversationId", authenticateBuyer, chatController.markAsRead);

/**
 * @route   GET /api/chat/conversations
 * @desc    Get all conversations for a buyer
 * @access  Private (Buyer)
 */
router.get("/conversations", authenticateBuyer, chatController.getBuyerConversations);

/**
 * RESELLER ROUTES
 */

/**
 * @route   GET /api/chat/reseller/conversations
 * @desc    Get all conversations for a reseller
 * @access  Private (Reseller)
 */
router.get(
  "/reseller/conversations",
  authenticateReseller,
  chatController.getResellerConversations
);

/**
 * @route   POST /api/chat/reseller/reply
 * @desc    Send a reply from reseller to buyer
 * @access  Private (Reseller)
 */
router.post(
  "/reseller/reply",
  authenticateReseller,
  chatController.sendResellerReply
);

export default router;
