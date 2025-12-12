import express from "express";
import * as dnsController from "../controllers/dnsController.js";

const router = express.Router();

/**
 * @route   POST /api/dns/:purchaseId/records
 * @desc    Add DNS record
 * @access  Public
 */
router.post("/:purchaseId/records", dnsController.addDnsRecord);

/**
 * @route   GET /api/dns/:purchaseId/records
 * @desc    Get DNS records
 * @access  Public
 */
router.get("/:purchaseId/records", dnsController.getDnsRecords);

/**
 * @route   PUT /api/dns/:purchaseId/records/:recordId
 * @desc    Update DNS record
 * @access  Public
 */
router.put("/:purchaseId/records/:recordId", dnsController.updateDnsRecord);

/**
 * @route   DELETE /api/dns/:purchaseId/records/:recordId
 * @desc    Delete DNS record
 * @access  Public
 */
router.delete("/:purchaseId/records/:recordId", dnsController.deleteDnsRecord);

/**
 * @route   POST /api/dns/:purchaseId/nameservers
 * @desc    Set custom nameservers
 * @access  Public
 */
router.post("/:purchaseId/nameservers", dnsController.setNameservers);

/**
 * @route   GET /api/dns/:purchaseId/domain-details
 * @desc    Get domain details with DNS info
 * @access  Public
 */
router.get("/:purchaseId/domain-details", dnsController.getDomainDetails);

export default router;
