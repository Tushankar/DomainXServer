import { validationResult } from "express-validator";
import DomainListing from "../models/DomainListing.js";
import Reseller from "../models/Reseller.js";

// @desc    Create a new domain listing
// @route   POST /api/reseller/domains/listing
// @access  Private (Reseller)
export const createDomainListing = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      domainName,
      category,
      description,
      askingPrice,
      minimumOffer,
      listingType,
      duration,
      keywords,
      registrar,
      expiryDate,
      traffic,
      revenue,
    } = req.body;

    console.log("=== CREATE DOMAIN LISTING ===");
    console.log("Keywords received:", keywords);
    console.log("Registrar received:", registrar);
    console.log("Request body:", req.body);

    // Check if domain is already listed
    const existingListing = await DomainListing.findOne({
      domainName: domainName.toLowerCase(),
      status: { $in: ["active", "paused"] },
    });

    if (existingListing) {
      return res.status(400).json({
        success: false,
        message: "This domain is already listed for sale",
      });
    }

    // Create the listing
    const listing = await DomainListing.create({
      resellerId: req.user.userId,
      domainName: domainName.toLowerCase(),
      category,
      description,
      askingPrice,
      minimumOffer,
      listingType,
      duration,
      keywords: keywords ? keywords.split(",").map((k) => k.trim()) : [],
      registrar,
      expiryDate,
      traffic,
      revenue,
    });

    console.log("Listing created with keywords:", listing.keywords);
    console.log("Listing created with registrar:", listing.registrar);

    // Update reseller's active domains count
    await Reseller.findByIdAndUpdate(req.user.userId, {
      $inc: { activeDomains: 1 },
    });

    // Return complete listing object
    const responseData = listing.toObject();
    console.log("=== SENDING RESPONSE ===");
    console.log("Full listing object:", responseData);

    res.status(201).json({
      success: true,
      message: "Domain listing created successfully",
      data: {
        listing: responseData,
      },
    });
  } catch (error) {
    console.error("Create domain listing error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get reseller's domain listings
// @route   GET /api/reseller/domains/listings
// @access  Private (Reseller)
export const getResellerListings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "all" } = req.query;

    const query = { resellerId: req.user.userId };
    if (status !== "all") {
      query.status = status;
    }

    const listings = await DomainListing.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-offers"); // Exclude offers for performance

    const total = await DomainListing.countDocuments(query);

    console.log("=== GET LISTINGS ===");
    listings.forEach((listing) => {
      console.log(
        `Domain: ${listing.domainName}, Keywords: ${listing.keywords}, Registrar: ${listing.registrar}`
      );
    });

    res.json({
      success: true,
      data: {
        listings: listings.map((listing) => ({
          id: listing._id,
          domainName: listing.domainName,
          category: listing.category,
          description: listing.description,
          askingPrice: listing.askingPrice,
          minimumOffer: listing.minimumOffer,
          listingType: listing.listingType,
          status: listing.status,
          views: listing.views,
          duration: listing.duration,
          expiryDate: listing.expiryDate,
          registrar: listing.registrar,
          traffic: listing.traffic,
          revenue: listing.revenue,
          keywords: listing.keywords,
          createdAt: listing.createdAt,
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get reseller listings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update domain listing
// @route   PUT /api/reseller/domains/listing/:id
// @access  Private (Reseller)
export const updateDomainListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await DomainListing.findOne({
      _id: id,
      resellerId: req.user.userId,
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Prevent updating sold listings
    if (listing.status === "sold") {
      return res.status(400).json({
        success: false,
        message: "Cannot update sold listings",
      });
    }

    const updateFields = [
      "category",
      "description",
      "askingPrice",
      "minimumOffer",
      "listingType",
      "duration",
      "keywords",
      "registrar",
      "expiryDate",
      "revenue",
    ];

    const updates = {};
    updateFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "keywords" && typeof req.body[field] === "string") {
          updates[field] = req.body[field].split(",").map((k) => k.trim());
        } else {
          updates[field] = req.body[field];
        }
      }
    });

    console.log("=== UPDATE DOMAIN LISTING ===");
    console.log("Domain ID:", id);
    console.log("Request body:", req.body);
    console.log("Updates to apply:", updates);

    const updatedListing = await DomainListing.findByIdAndUpdate(id, updates, {
      new: true,
    });

    console.log("Updated listing keywords:", updatedListing.keywords);
    console.log("Updated listing registrar:", updatedListing.registrar);

    res.json({
      success: true,
      message: "Listing updated successfully",
      data: {
        listing: {
          id: updatedListing._id,
          domainName: updatedListing.domainName,
          askingPrice: updatedListing.askingPrice,
          status: updatedListing.status,
        },
      },
    });
  } catch (error) {
    console.error("Update domain listing error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Delete domain listing
// @route   DELETE /api/reseller/domains/listing/:id
// @access  Private (Reseller)
export const deleteDomainListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await DomainListing.findOne({
      _id: id,
      resellerId: req.user.userId,
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Prevent deleting sold listings
    if (listing.status === "sold") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete sold listings",
      });
    }

    await DomainListing.findByIdAndDelete(id);

    // Update reseller's active domains count
    await Reseller.findByIdAndUpdate(req.user.userId, {
      $inc: { activeDomains: -1 },
    });

    res.json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (error) {
    console.error("Delete domain listing error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Pause/Resume domain listing
// @route   PATCH /api/reseller/domains/listing/:id/status
// @access  Private (Reseller)
export const updateListingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "paused"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'active' or 'paused'",
      });
    }

    const listing = await DomainListing.findOne({
      _id: id,
      resellerId: req.user.userId,
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Prevent status changes for sold or expired listings
    if (["sold", "expired"].includes(listing.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status of ${listing.status} listings`,
      });
    }

    listing.status = status;
    await listing.save();

    res.json({
      success: true,
      message: `Listing ${
        status === "active" ? "resumed" : "paused"
      } successfully`,
      data: {
        listing: {
          id: listing._id,
          status: listing.status,
        },
      },
    });
  } catch (error) {
    console.error("Update listing status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get all active domain listings (Public)
// @route   GET /api/listings/all
// @access  Public
export const getAllActiveDomainListings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category = "all",
      sort = "-createdAt",
    } = req.query;

    const query = { status: "active" };

    // Only filter by category if it's provided and not "all" or empty string
    if (category && category !== "all" && category !== "") {
      query.category = category;
    }

    const listings = await DomainListing.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-offers");

    const total = await DomainListing.countDocuments(query);

    console.log("=== GET ALL ACTIVE LISTINGS ===");
    console.log(
      `Total listings: ${total}, Category filter: ${category}, Query:`,
      query
    );
    listings.forEach((listing) => {
      console.log(
        `Domain: ${listing.domainName}, Price: ₹${listing.askingPrice}, Keywords: ${listing.keywords.length}`
      );
    });

    res.json({
      success: true,
      listings: listings.map((listing) => ({
        _id: listing._id,
        resellerId: listing.resellerId,
        domainName: listing.domainName,
        category: listing.category,
        description: listing.description,
        askingPrice: listing.askingPrice,
        minimumOffer: listing.minimumOffer,
        listingType: listing.listingType,
        status: listing.status,
        views: listing.views,
        duration: listing.duration,
        expiryDate: listing.expiryDate,
        registrar: listing.registrar,
        traffic: listing.traffic,
        revenue: listing.revenue,
        keywords: listing.keywords,
        createdAt: listing.createdAt,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all listings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
