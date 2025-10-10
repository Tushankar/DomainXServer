import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    // Landing Page Content
    landing: {
      title: { type: String, default: "DomainX World 2025: Elevate together" },
      subtitle: {
        type: String,
        default:
          "Discover, buy, and sell premium domains with our AI-powered platform. Find the perfect domain for your business today.",
      },
      listButton: { type: String, default: "List a domain" },
      blogButton: { type: String, default: "Read the blog" },
      searchPlaceholder: { type: String, default: "Enter domain name..." },
    },

    // About Us Content
    about: {
      title: { type: String, default: "Know About Us" },
      subtitle: {
        type: String,
        default: "An exchange created by domainers for domainers",
      },
      points: {
        type: [String],
        default: [
          "Domainers shouldn't lose 10-20% when they sell.",
          "Domain sellers don't want to wait days for their payment.",
          "Domainers prefer to deal directly with buyers/sellers.",
          "Domainers prefer to negotiate their own price and terms.",
          "Domainers want to avoid middlemen and their fees.",
        ],
      },
    },

    // Domain Selling Content
    selling: {
      title: { type: String, default: "Ready to sell your domain?" },
      subtitle: {
        type: String,
        default: "List your domain and reach thousands of potential buyers.",
      },
    },

    // Domain Registration Content
    registration: {
      title: { type: String, default: "What is first up for your business?" },
      subtitle: {
        type: String,
        default: "Find the perfect domain for your brand.",
      },
    },

    // Domain Pricing Content
    pricing: {
      title: { type: String, default: "Choose Your Perfect Domain Extension" },
      subtitle: {
        type: String,
        default: "Find the right domain extension for your brand and budget",
      },
      cards: {
        type: [
          {
            extension: String,
            description: String,
            originalPrice: String,
            currentPrice: String,
            renewPrice: String,
            discount: String,
            buttonText: String,
          },
        ],
        default: [
          {
            extension: ".com",
            description: "Get instant online credibility",
            originalPrice: "$9.66",
            currentPrice: "$8.88",
            renewPrice: "$9.98",
            discount: "8% OFF",
            buttonText: "Discover your .com",
          },
          {
            extension: ".net",
            description: "Capture a timeless original",
            originalPrice: null,
            currentPrice: "$11.20",
            renewPrice: "$11.20",
            discount: null,
            buttonText: "Discover your .net",
          },
          {
            extension: ".org",
            description: "Make a difference",
            originalPrice: "$9.80",
            currentPrice: "$6.48",
            renewPrice: "$9.80",
            discount: "33% OFF",
            buttonText: "Discover your .org",
          },
          {
            extension: ".xyz",
            description: "Go next generation",
            originalPrice: "$12.99",
            currentPrice: "$2.08",
            renewPrice: "$12.99",
            discount: "84% OFF",
            buttonText: "Discover your .xyz",
          },
          {
            extension: ".online",
            description: "Secure a modern classic",
            originalPrice: "$39.99",
            currentPrice: "$1.99",
            renewPrice: "$39.99",
            discount: "95% OFF",
            buttonText: "Discover your .online",
          },
          {
            extension: ".io",
            description: "Build for developers",
            originalPrice: "$49.99",
            currentPrice: "$33.99",
            renewPrice: "$49.99",
            discount: "33% OFF",
            buttonText: "Discover your .io",
          },
        ],
      },
    },

    // News & Events Content
    news: {
      heroTitle: { type: String },
      heroImage: { type: String },
      heroCta: { type: String },
      cards: {
        type: [
          {
            title: String,
            description: String,
            image: String,
            cta: String,
            type: String,
          },
        ],
      },
    },

    // Footer Content
    footer: {
      resources: {
        type: [String],
        default: ["Careers", "Developers", "Investors", "Partners"],
      },
      solutions: {
        type: [String],
        default: [
          "Domain Registration",
          "Domain Selling",
          "Domain Analytics",
          "Reseller Program",
        ],
      },
      support: {
        type: [String],
        default: ["Help Center", "Contact Us", "API Docs", "Status"],
      },
    },

    // Promo Banner Content
    promo: {
      text: { type: String, default: "Get 50% OFF QuickBooks for 3 months*" },
      button: { type: String, default: "Buy now" },
    },

    // Trusted Partners Content
    partners: {
      title: { type: String },
      categories: { type: [String] },
      logos: { type: Object },
    },

    // FAQ Content
    faq: {
      tabs: { type: [String] },
      questions: { type: Object },
    },
  },
  {
    timestamps: true,
  }
);

const Content = mongoose.model("Content", contentSchema);
export default Content;
