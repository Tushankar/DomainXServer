import DomainPurchase from "../models/DomainPurchase.js";

/**
 * Add DNS record to domain
 */
export const addDnsRecord = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const { recordType, name, value, ttl = 3600, priority } = req.body;
    const buyerId = req.user?.id || req.body.buyerId;

    // Validate required fields
    if (!recordType || !value) {
      return res.status(400).json({
        success: false,
        message: "Record type and value are required",
      });
    }

    // Find purchase and verify ownership
    const purchase = await DomainPurchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Domain purchase not found",
      });
    }

    if (purchase.buyerId.toString() !== buyerId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to modify this domain",
      });
    }

    // Check if domain is active
    if (purchase.paymentStatus !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Domain purchase must be completed before adding DNS records",
      });
    }

    // Add DNS record
    const dnsRecord = {
      recordType,
      name: name || `@`, // @ for root domain
      value,
      ttl,
      ...(priority && { priority }),
    };

    purchase.dnsRecords.push(dnsRecord);
    await purchase.save();

    return res.status(200).json({
      success: true,
      message: "DNS record added successfully",
      data: purchase.dnsRecords,
    });
  } catch (error) {
    console.error("Error adding DNS record:", error);
    return res.status(500).json({
      success: false,
      message: "Error adding DNS record",
      error: error.message,
    });
  }
};

/**
 * Get DNS records for domain
 */
export const getDnsRecords = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const buyerId = req.user?.id || req.query.buyerId;

    const purchase = await DomainPurchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Domain purchase not found",
      });
    }

    if (purchase.buyerId.toString() !== buyerId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this domain",
      });
    }

    return res.status(200).json({
      success: true,
      message: "DNS records retrieved successfully",
      data: {
        domain: purchase.domain,
        dnsRecords: purchase.dnsRecords,
        defaultNameservers: purchase.defaultNameservers,
        nameserverSetupCompleted: purchase.nameserverSetupCompleted,
      },
    });
  } catch (error) {
    console.error("Error fetching DNS records:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching DNS records",
      error: error.message,
    });
  }
};

/**
 * Update DNS record
 */
export const updateDnsRecord = async (req, res) => {
  try {
    const { purchaseId, recordId } = req.params;
    const { recordType, name, value, ttl, priority } = req.body;
    const buyerId = req.user?.id || req.body.buyerId;

    const purchase = await DomainPurchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Domain purchase not found",
      });
    }

    if (purchase.buyerId.toString() !== buyerId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to modify this domain",
      });
    }

    // Find and update DNS record
    const record = purchase.dnsRecords.id(recordId);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "DNS record not found",
      });
    }

    if (recordType) record.recordType = recordType;
    if (name) record.name = name;
    if (value) record.value = value;
    if (ttl) record.ttl = ttl;
    if (priority !== undefined) record.priority = priority;

    await purchase.save();

    return res.status(200).json({
      success: true,
      message: "DNS record updated successfully",
      data: purchase.dnsRecords,
    });
  } catch (error) {
    console.error("Error updating DNS record:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating DNS record",
      error: error.message,
    });
  }
};

/**
 * Delete DNS record
 */
export const deleteDnsRecord = async (req, res) => {
  try {
    const { purchaseId, recordId } = req.params;
    const buyerId = req.user?.id || req.body.buyerId;

    const purchase = await DomainPurchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Domain purchase not found",
      });
    }

    if (purchase.buyerId.toString() !== buyerId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to modify this domain",
      });
    }

    // Delete DNS record
    purchase.dnsRecords.id(recordId).deleteOne();
    await purchase.save();

    return res.status(200).json({
      success: true,
      message: "DNS record deleted successfully",
      data: purchase.dnsRecords,
    });
  } catch (error) {
    console.error("Error deleting DNS record:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting DNS record",
      error: error.message,
    });
  }
};

/**
 * Set custom nameservers
 */
export const setNameservers = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const { nameservers } = req.body;
    const buyerId = req.user?.id || req.body.buyerId;

    if (
      !nameservers ||
      !Array.isArray(nameservers) ||
      nameservers.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid nameservers array is required",
      });
    }

    const purchase = await DomainPurchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Domain purchase not found",
      });
    }

    if (purchase.buyerId.toString() !== buyerId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to modify this domain",
      });
    }

    purchase.defaultNameservers = nameservers;
    purchase.nameserverSetupCompleted = true;
    await purchase.save();

    return res.status(200).json({
      success: true,
      message: "Nameservers updated successfully",
      data: {
        domain: purchase.domain,
        nameservers: purchase.defaultNameservers,
        setupCompleted: purchase.nameserverSetupCompleted,
      },
    });
  } catch (error) {
    console.error("Error setting nameservers:", error);
    return res.status(500).json({
      success: false,
      message: "Error setting nameservers",
      error: error.message,
    });
  }
};

/**
 * Get domain details with DNS info
 */
export const getDomainDetails = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const buyerId = req.user?.id || req.query.buyerId;

    const purchase = await DomainPurchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Domain purchase not found",
      });
    }

    if (purchase.buyerId.toString() !== buyerId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this domain",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Domain details retrieved successfully",
      data: {
        domain: purchase.domain,
        sld: purchase.sld,
        tld: purchase.tld,
        orderNumber: purchase.orderNumber,
        purchasePrice: purchase.purchasePrice,
        paymentStatus: purchase.paymentStatus,
        domainStatus: purchase.domainStatus,
        expirationDate: purchase.expirationDate,
        autoRenewal: purchase.autoRenewal,
        dnsRecords: purchase.dnsRecords,
        defaultNameservers: purchase.defaultNameservers,
        nameserverSetupCompleted: purchase.nameserverSetupCompleted,
        paymentDate: purchase.paymentDate,
        transactionId: purchase.transactionId,
      },
    });
  } catch (error) {
    console.error("Error fetching domain details:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching domain details",
      error: error.message,
    });
  }
};
