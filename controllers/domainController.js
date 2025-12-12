import axios from "axios";

const ESTIBOT_API_KEY =
  process.env.ESTIBOT_API_KEY || "FgqZcWzL5f0qJmPRZHB9rKt16";
const ESTIBOT_API_URL = "https://www.estibot.com/api";

/**
 * Appraise a single domain or multiple domains
 * Performs domain valuation using Estibot API
 */
export const appraiseDomain = async (req, res) => {
  try {
    const { domain, domains, queryType = "cache" } = req.body;

    // Validate input
    if (!domain && (!domains || domains.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a domain or list of domains to appraise",
      });
    }

    // Prepare domain string (single or multiple)
    let domainString;
    if (domain) {
      domainString = domain.toLowerCase().trim();
    } else if (domains && Array.isArray(domains)) {
      // Maximum 200 domains per submission
      if (domains.length > 200) {
        return res.status(400).json({
          success: false,
          message: "Maximum 200 domains per submission",
        });
      }
      domainString = domains.map((d) => d.toLowerCase().trim()).join(">>");
    }

    // Validate query type
    const validQueryTypes = ["auto", "cache", "live"];
    if (!validQueryTypes.includes(queryType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid query type. Must be 'auto', 'cache', or 'live'",
      });
    }

    // Build API URL
    let apiUrl = `${ESTIBOT_API_URL}?k=${ESTIBOT_API_KEY}&a=appraise&d=${encodeURIComponent(
      domainString
    )}`;

    // Add query type parameter if not auto (auto is default for single domains)
    if (queryType !== "auto" || domainString.includes(">>")) {
      apiUrl += `&t=${queryType}`;
    }

    console.log(`🔍 Fetching appraisal for: ${domainString}`);

    // Call Estibot API
    const response = await axios.get(apiUrl, {
      timeout: 30000, // 30 second timeout
    });

    // Check if API call was successful
    if (!response.data.success) {
      return res.status(400).json({
        success: false,
        message: response.data.message || "Failed to appraise domain",
        error: response.data,
      });
    }

    // Return formatted response - flatten the data structure
    return res.status(200).json({
      success: true,
      message: "Domain appraisal successful",
      data: {
        results: response.data.results?.data || response.data.results || [],
        not_found: response.data.not_found || [],
        cache: response.data.cache || false,
        bulk: response.data.bulk || false,
        item_count:
          response.data.item_count || response.data.results?.count || 0,
      },
    });
  } catch (error) {
    console.error("❌ Appraisal Error:", error.message);

    // Handle timeout
    if (error.code === "ECONNABORTED") {
      return res.status(504).json({
        success: false,
        message:
          "Request timeout. The appraisal service took too long to respond",
      });
    }

    // Handle network errors
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: "Error from appraisal service",
        error: error.response.data,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error appraising domain",
      error: error.message,
    });
  }
};

/**
 * Get leads for a domain
 * Generates end-user leads for a particular domain or keyword
 */
export const generateLeads = async (req, res) => {
  try {
    const { domain, keyword } = req.body;

    // Validate input
    if (!domain) {
      return res.status(400).json({
        success: false,
        message: "Please provide a domain",
      });
    }

    // Build API URL
    let apiUrl = `${ESTIBOT_API_URL}?k=${ESTIBOT_API_KEY}&a=lead&d=${encodeURIComponent(
      domain.toLowerCase().trim()
    )}`;

    // Add keyword if provided
    if (keyword) {
      apiUrl += `&keyword=${encodeURIComponent(keyword.trim())}`;
    }

    console.log(`🎯 Generating leads for: ${domain}`);

    // Call Estibot API (can take up to 60 seconds)
    const response = await axios.get(apiUrl, {
      timeout: 70000, // 70 second timeout for lead generation
    });

    // Check if API call was successful
    if (!response.data.success) {
      return res.status(400).json({
        success: false,
        message: response.data.message || "Failed to generate leads",
        error: response.data,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lead generation successful",
      data: response.data.results || [],
    });
  } catch (error) {
    console.error("❌ Lead Generation Error:", error.message);

    if (error.code === "ECONNABORTED") {
      return res.status(504).json({
        success: false,
        message: "Request timeout. Lead generation took too long to respond",
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: "Error from lead generation service",
        error: error.response.data,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error generating leads",
      error: error.message,
    });
  }
};

/**
 * Get domain information
 * Returns web site crawl summary, domain usage status, and more
 */
export const getDomainInfo = async (req, res) => {
  try {
    const { domain, domains } = req.body;

    // Validate input
    if (!domain && (!domains || domains.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a domain or list of domains",
      });
    }

    // Prepare domain string
    let domainString;
    if (domain) {
      domainString = domain.toLowerCase().trim();
    } else {
      domainString = domains.map((d) => d.toLowerCase().trim()).join(">>");
    }

    // Build API URL
    const apiUrl = `${ESTIBOT_API_URL}?k=${ESTIBOT_API_KEY}&a=site_info&d=${encodeURIComponent(
      domainString
    )}`;

    console.log(`ℹ️ Fetching domain info for: ${domainString}`);

    // Call Estibot API
    const response = await axios.get(apiUrl, {
      timeout: 30000,
    });

    // Check if API call was successful
    if (!response.data.success) {
      return res.status(400).json({
        success: false,
        message: response.data.message || "Failed to fetch domain info",
        error: response.data,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Domain info retrieved successfully",
      data: response.data.results || [],
    });
  } catch (error) {
    console.error("❌ Domain Info Error:", error.message);

    if (error.code === "ECONNABORTED") {
      return res.status(504).json({
        success: false,
        message: "Request timeout",
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: "Error from domain info service",
        error: error.response.data,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error fetching domain info",
      error: error.message,
    });
  }
};

/**
 * Get search volume and CPC data for keywords
 */
export const getSearchVolumeData = async (req, res) => {
  try {
    const { keywords } = req.body;

    // Validate input
    if (!keywords || keywords.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one keyword",
      });
    }

    // Maximum 3 concurrent threads - handle this on client side
    const keywordString = keywords.join(">>");

    // Build API URL
    const apiUrl = `${ESTIBOT_API_URL}?k=${ESTIBOT_API_KEY}&a=bid_tool&d=${encodeURIComponent(
      keywordString
    )}`;

    console.log(`📊 Fetching search volume for: ${keywordString}`);

    // Call Estibot API
    const response = await axios.get(apiUrl, {
      timeout: 30000,
    });

    // Check if API call was successful
    if (!response.data.success) {
      return res.status(400).json({
        success: false,
        message: response.data.message || "Failed to fetch search volume data",
        error: response.data,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Search volume data retrieved successfully",
      data: response.data.results || [],
    });
  } catch (error) {
    console.error("❌ Search Volume Error:", error.message);

    if (error.code === "ECONNABORTED") {
      return res.status(504).json({
        success: false,
        message: "Request timeout",
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: "Error from search volume service",
        error: error.response.data,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error fetching search volume data",
      error: error.message,
    });
  }
};
