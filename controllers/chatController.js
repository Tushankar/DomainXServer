import Chat from "../models/Chat.js";
import DomainListing from "../models/DomainListing.js";
import Buyer from "../models/Buyer.js";
import Reseller from "../models/Reseller.js";

/**
 * @desc    Send a message in a conversation
 * @route   POST /api/chat/send
 * @access  Private (Buyer or Reseller)
 */
export const sendMessage = async (req, res) => {
  try {
    const { domainId, message, resellerId } = req.body;
    const buyerId = req.user?.userId;
    const senderType = req.user?.userType || "buyer";

    if (!buyerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!domainId || !message) {
      return res.status(400).json({
        success: false,
        message: "Domain ID and message are required",
      });
    }

    // Get domain to find reseller if not provided
    const domain = await DomainListing.findById(domainId);
    if (!domain) {
      return res.status(404).json({
        success: false,
        message: "Domain not found",
      });
    }

    const actualResellerId = resellerId || domain.resellerId;

    // Find or create conversation
    let conversation = await Chat.findOne({
      buyerId,
      resellerId: actualResellerId,
      domainId,
    });

    const newMessage = {
      senderId: buyerId,
      senderType,
      message: message.trim(),
      timestamp: new Date(),
      isRead: false,
    };

    if (conversation) {
      // Add message to existing conversation
      conversation.messages.push(newMessage);
      conversation.lastMessageAt = new Date();
      await conversation.save();
    } else {
      // Create new conversation
      conversation = await Chat.create({
        buyerId,
        resellerId: actualResellerId,
        domainId,
        messages: [newMessage],
        lastMessageAt: new Date(),
      });
    }

    // Populate the conversation
    await conversation.populate([
      { path: "buyerId", select: "name email" },
      { path: "resellerId", select: "name email" },
      { path: "domainId", select: "domainName askingPrice" },
    ]);

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: conversation,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

/**
 * @desc    Get conversation for a specific domain
 * @route   GET /api/chat/conversation/:domainId
 * @access  Private (Buyer or Reseller)
 */
export const getConversation = async (req, res) => {
  try {
    const { domainId } = req.params;
    const userId = req.user?.userId;
    const userType = req.user?.userType || "buyer";

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Build query based on user type
    const query = { domainId };
    if (userType === "buyer") {
      query.buyerId = userId;
    } else if (userType === "reseller") {
      query.resellerId = userId;
    }

    const conversation = await Chat.findOne(query).populate([
      { path: "buyerId", select: "name email profileImage" },
      { path: "resellerId", select: "name email company" },
      { path: "domainId", select: "domainName askingPrice category" },
    ]);

    if (!conversation) {
      return res.status(200).json({
        success: true,
        message: "No conversation found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversation",
      error: error.message,
    });
  }
};

/**
 * @desc    Mark messages as read
 * @route   PUT /api/chat/read/:conversationId
 * @access  Private (Buyer or Reseller)
 */
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const conversation = await Chat.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Mark messages as read where recipient is current user
    conversation.messages.forEach((msg) => {
      if (msg.senderId.toString() !== userId.toString()) {
        msg.isRead = true;
      }
    });

    await conversation.save();

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all conversations for a buyer
 * @route   GET /api/chat/conversations
 * @access  Private (Buyer)
 */
export const getBuyerConversations = async (req, res) => {
  try {
    const buyerId = req.user?.userId;

    if (!buyerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const conversations = await Chat.find({ buyerId })
      .populate([
        { path: "resellerId", select: "name email company" },
        { path: "domainId", select: "domainName askingPrice category" },
      ])
      .sort({ lastMessageAt: -1 });

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all conversations for a reseller
 * @route   GET /api/chat/reseller/conversations
 * @access  Private (Reseller)
 */
export const getResellerConversations = async (req, res) => {
  try {
    const resellerId = req.user?.userId;

    if (!resellerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const conversations = await Chat.find({ resellerId })
      .populate([
        { path: "buyerId", select: "name email company profileImage" },
        { path: "domainId", select: "domainName askingPrice category" },
      ])
      .sort({ lastMessageAt: -1 });

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (error) {
    console.error("Error fetching reseller conversations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
      error: error.message,
    });
  }
};

/**
 * @desc    Send a reply from reseller to buyer  
 * @route   POST /api/chat/reseller/reply
 * @access  Private (Reseller)
 */
export const sendResellerReply = async (req, res) => {
  try {
    const { conversationId, message } = req.body;
    const resellerId = req.user?.userId;

    if (!resellerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!conversationId || !message) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID and message are required",
      });
    }

    // Find conversation
    const conversation = await Chat.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Verify reseller owns this conversation
    if (conversation.resellerId.toString() !== resellerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. This conversation does not belong to you.",
      });
    }

    // Add message
    const newMessage = {
      senderId: resellerId,
      senderType: "reseller",
      message: message.trim(),
      timestamp: new Date(),
      isRead: false,
    };

    conversation.messages.push(newMessage);
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Populate and return
    await conversation.populate([
      { path: "buyerId", select: "name email profileImage" },
      { path: "resellerId", select: "name email company" },
      { path: "domainId", select: "domainName askingPrice category" },
    ]);

    res.status(200).json({
      success: true,
      message: "Reply sent successfully",
      data: conversation,
    });
  } catch (error) {
    console.error("Error sending reseller reply:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send reply",
      error: error.message,
    });
  }
};

