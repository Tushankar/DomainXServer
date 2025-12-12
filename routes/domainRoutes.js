import express from "express";
import * as domainController from "../controllers/domainController.js";
import { getAllActiveDomainListings } from "../controllers/domainListingController.js";

const router = express.Router();

/**
 * @route   GET /api/domains/listings/all
 * @desc    Get all active domain listings (Public)
 * @access  Public
 * @query   { page: number, limit: number, category: string, sort: string }
 */
router.get("/listings/all", getAllActiveDomainListings);

/**
 * @route   POST /api/domains/appraise
 * @desc    Appraise one or more domains
 * @access  Public
 * @body    { domain: string } or { domains: string[] }
 * @body    { queryType: 'auto' | 'cache' | 'live' } - optional, default: 'cache'
 */
router.post("/appraise", domainController.appraiseDomain);

/**
 * @route   POST /api/domains/leads
 * @desc    Generate leads for a domain
 * @access  Public
 * @body    { domain: string, keyword: string (optional) }
 */
router.post("/leads", domainController.generateLeads);

/**
 * @route   POST /api/domains/info
 * @desc    Get domain website information
 * @access  Public
 * @body    { domain: string } or { domains: string[] }
 */
router.post("/info", domainController.getDomainInfo);

/**
 * @route   POST /api/domains/search-volume
 * @desc    Get search volume and CPC data for keywords
 * @access  Public
 * @body    { keywords: string[] }
 */
router.post("/search-volume", domainController.getSearchVolumeData);

export default router;
