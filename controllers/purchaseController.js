import DomainWishlist from "../models/DomainWishlist.js";
import DomainListing from "../models/DomainListing.js";
import Buyer from "../models/Buyer.js";

/**
 * @desc    Add domain to wishlist
 * @route   POST /api/wishlist/add
 * @access  Private (Buyer)
 */
export const addToWishlist = async (req, res) => {
  try {
    const { domainId } = req.body;
    const buyerId = req.user?.userId;

    if (!buyerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login to add to wishlist.",
      });
    }

    if (!domainId) {
      return res.status(400).json({
        success: false,
        message: "Domain ID is required",
      });
    }

    // Check if domain exists
    const domainListing = await DomainListing.findById(domainId);
    if (!domainListing) {
      return res.status(404).json({
        success: false,
        message: "Domain listing not found",
      });
    }

    // Check if already in wishlist
    const existingWishlist = await DomainWishlist.findOne({
      buyerId,
      domainId,
    });

    if (existingWishlist) {
      return res.status(400).json({
        success: false,
        message: "Domain already in wishlist",
      });
    }

    // Create wishlist entry
    const wishlistEntry = await DomainWishlist.create({
      buyerId,
      domainId,
      domain: domainListing.domainName,
      sld: domainListing.domainName.split(".")[0],
      tld: domainListing.domainName.split(".").slice(1).join("."),
      appraised_value: domainListing.askingPrice,
      appraised_wholesale_value: domainListing.minimumOffer,
    });

    res.status(201).json({
      success: true,
      message: "Domain added to wishlist successfully",
      data: wishlistEntry,
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add domain to wishlist",
      error: error.message,
    });
  }
};

/**
 * @desc    Get user's wishlist
 * @route   GET /api/wishlist
 * @access  Private (Buyer)
 */
export const getWishlist = async (req, res) => {
  try {
    const buyerId = req.user?.userId;

    if (!buyerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Get wishlist with populated domain details
    const wishlist = await DomainWishlist.find({ buyerId })
      .populate({
        path: "domainId",
        select: "domainName category askingPrice minimumOffer description keywords registrar expiryDate traffic revenue views resellerId status",
        populate: {
          path: "resellerId",
          select: "name email company",
        },
      })
      .sort({ createdAt: -1 });

    // Filter out entries where domain was deleted
    const validWishlist = wishlist.filter((item) => item.domainId);

    res.status(200).json({
      success: true,
      count: validWishlist.length,
      data: validWishlist,
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
      error: error.message,
    });
  }
};

/**
 * @desc    Remove domain from wishlist
 * @route   DELETE /api/wishlist/:domainId
 * @access  Private (Buyer)
 */
export const removeFromWishlist = async (req, res) => {
  try {
    const { domainId } = req.params;
    const buyerId = req.user?.userId;

    if (!buyerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const deleted = await DomainWishlist.findOneAndDelete({
      buyerId,
      domainId,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Domain not found in wishlist",
      });
    }

    res.status(200).json({
      success: true,
      message: "Domain removed from wishlist successfully",
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove domain from wishlist",
      error: error.message,
    });
  }
};

/**
 * @desc    Check if domain is in wishlist
 * @route   GET /api/wishlist/check/:domainId
 * @access  Private (Buyer)
 */
export const isInWishlist = async (req, res) => {
  try {
    const { domainId } = req.params;
    const buyerId = req.user?.userId;

    if (!buyerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const exists = await DomainWishlist.findOne({
      buyerId,
      domainId,
    });

    res.status(200).json({
      success: true,
      isInWishlist: !!exists,
    });
  } catch (error) {
    console.error("Error checking wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check wishlist",
      error: error.message,
    });
  }
};

/**
 * @desc    Get pending price approvals (Admin only - placeholder)
 * @route   GET /api/purchases/approvals/pending
 * @access  Admin
 */
export const getPendingPriceApprovals = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin feature - to be implemented",
    data: [],
  });
};

/**
 * @desc    Approve domain price (Admin only - placeholder)
 * @route   POST /api/purchases/approvals/:purchaseId/approve
 * @access  Admin
 */
export const approveDomainPrice = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin feature - to be implemented",
  });
};

/**
 * @desc    Reject domain price (Admin only - placeholder)
 * @route   POST /api/purchases/approvals/:purchaseId/reject
 * @access  Admin
 */
export const rejectDomainPrice = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin feature - to be implemented",
  });
};

/**
 * @desc    Get approved domains (placeholder)
 * @route   GET /api/purchases/approved/list
 * @access  Private
 */
export const getApprovedDomains = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Feature to be implemented",
    data: [],
  });
};

/**
 * @desc    Get user's purchases (placeholder)
 * @route   GET /api/purchases
 * @access  Private
 */
export const getPurchases = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Feature to be implemented",
    data: [],
  });
};

/**
 * @desc    Get purchase details (placeholder)
 * @route   GET /api/purchases/:purchaseId
 * @access  Private
 */
export const getPurchaseDetails = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Feature to be implemented",
    data: null,
  });
};
