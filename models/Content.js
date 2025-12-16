import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    // Landing Page Content
    landing: {
      title: {
        type: String,
        default: " Domainsxchange World 2025: Elevate together",
      },
      subtitle: {
        type: String,
        default:
          "Discover, buy, and sell premium domains with our AI-powered platform. Find the perfect domain for your business today.",
      },
      listButton: { type: String, default: "List a domain" },
      blogButton: { type: String, default: "Read the blog" },
      searchPlaceholder: { type: String, default: "Enter domain name..." },
      // Styling fields for visual customization
      styles: {
        gradientFrom: { type: String, default: "#010101" },
        gradientVia: { type: String, default: "#0a1a3a" },
        gradientTo: { type: String, default: "#21AFD9" },
        titleGradientFrom: { type: String, default: "#51D96A" },
        titleGradientTo: { type: String, default: "#21AFD9" },
        subtitleColor: { type: String, default: "#D1D5DB" },
        primaryButtonBg: { type: String, default: "#51D96A" },
        primaryButtonHover: { type: String, default: "#45c55e" },
        primaryButtonText: { type: String, default: "#FFFFFF" },
        secondaryButtonBorder: { type: String, default: "#51D96A" },
        secondaryButtonText: { type: String, default: "#51D96A" },
        secondaryButtonHoverBg: { type: String, default: "#51D96A" },
        searchButtonBg: { type: String, default: "#51D96A" },
        cardBg: { type: String, default: "rgba(0,0,0,0.4)" },
        cardBorder: { type: String, default: "rgba(33,175,217,0.3)" },
      },
      // Image fields
      images: {
        heroBackground: { type: String, default: null },
        logo: { type: String, default: null },
      },
      // Page builder sections for drag-and-drop
      sections: { type: mongoose.Schema.Types.Mixed, default: null },
      pageStyles: {
        bgType: { type: String, default: "gradient" },
        bgColor: { type: String, default: "#0d1117" },
        solidColor: { type: String, default: "#0d1117" },
        bgImage: { type: String, default: "" },
        gradientFrom: { type: String, default: "#0d1117" },
        gradientVia: { type: String, default: "#0a1a3a" },
        gradientTo: { type: String, default: "#21AFD9" },
      },
    },

    // About Us Content
    about: {
      title: { type: String, default: "Know About Us" },
      subtitle: {
        type: String,
        default: "An exchange created by domainers for domainers",
      },
      description: {
        type: String,
        default:
          "We are a group of domainers who make our living buying and selling domains.",
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
      pointsFooter: { type: String, default: "" },
      images: {
        main: {
          type: String,
          default:
            "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
        },
        small: {
          type: String,
          default: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0",
        },
      },
      sections: { type: mongoose.Schema.Types.Mixed, default: null },
      rating: {
        score: { type: String, default: "4.9/5" },
        reviews: { type: String, default: "★ 19,201 reviews" },
        subtitle: {
          type: String,
          default: "Discover Our TrustScore & Customer Reviews",
        },
      },
      buttonText: { type: String, default: "Start Trading Domains" },
      buttonLink: { type: String, default: "/domains" },
      styles: {
        bgColor: { type: String, default: "#F9FAFB" },
        titleGradientFrom: { type: String, default: "#51D96A" },
        titleGradientTo: { type: String, default: "#21AFD9" },
        subtitleColor: { type: String, default: "#1F2937" },
        pointsColor: { type: String, default: "#4B5563" },
        buttonGradientFrom: { type: String, default: "#51D96A" },
        buttonGradientTo: { type: String, default: "#21AFD9" },
        buttonTextColor: { type: String, default: "#FFFFFF" },
      },
      // Page builder sections for drag-and-drop
      sections: { type: mongoose.Schema.Types.Mixed, default: null },
      pageStyles: {
        bgColor: { type: String, default: "#F9FAFB" },
      },
    },

    // Domain Selling Content
    selling: {
      title: { type: String, default: "Ready to sell your domain?" },
      subtitle: {
        type: String,
        default: "List your domain and reach thousands of potential buyers.",
      },
      left: {
        title: { type: String, default: "Sell Domains" },
        description: {
          type: String,
          default: "List your premium domains and connect with serious buyers.",
        },
        buttonText: { type: String, default: "List Your Domain" },
        buttonLink: { type: String, default: "/login/reseller" },
      },
      cards: {
        type: [
          {
            image: String,
            title: String,
            description: String,
            buttonText: String,
            buttonLink: String,
          },
        ],
        default: [
          {
            image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44",
            title: "Premium Listing",
            description:
              "Get maximum exposure for your domain with our premium listing service.",
            buttonText: "Upgrade Listing",
            buttonLink: "#",
          },
          {
            image: "",
            title: "Quick Sale Service",
            description:
              "Need to sell fast? Our quick sale service connects you with verified buyers within 48 hours.",
            buttonText: "Sell Now",
            buttonLink: "#",
          },
        ],
      },
      bottom: {
        title: { type: String, default: "Every step to selling success" },
        subtitle: {
          type: String,
          default: "Domain selling is just the beginning of your success story",
        },
        contentTitle: { type: String, default: "Sell a domain" },
        contentDescription: {
          type: String,
          default: "List your domain and connect with serious buyers.",
        },
        ctaText: { type: String, default: "Discover all selling options" },
        ctaLink: { type: String, default: "#" },
      },
      // Page builder sections for drag-and-drop
      sections: { type: mongoose.Schema.Types.Mixed, default: null },
      pageStyles: {
        bgColor: { type: String, default: "#F9FAFB" },
      },
    },

    // Domain Registration Content
    registration: {
      title: { type: String, default: "What is first up for your business?" },
      subtitle: {
        type: String,
        default: "Find the perfect domain for your brand.",
      },
      left: {
        title: { type: String, default: "Domains" },
        description: {
          type: String,
          default:
            "Get started with the perfect domain, which comes with free domain privacy protection forever.",
        },
        buttonText: { type: String, default: "Search Domains" },
        buttonLink: { type: String, default: "/domains" },
      },
      cards: {
        type: [
          {
            image: String,
            title: String,
            description: String,
            buttonText: String,
            buttonLink: String,
          },
        ],
        default: [
          {
            image:
              "https://images.unsplash.com/photo-1490750967868-88aa4486c946",
            title: ".co for ₹ 1.00/1st year",
            description: "Make a name for your business. Get a .co domain.",
            buttonText: "Get .co Domain",
            buttonLink: "#",
          },
          {
            image: "",
            title: ".in for ₹ 399/1st year",
            description: "Establish your Indian identity online.",
            buttonText: "Get .in Domain",
            buttonLink: "#",
          },
        ],
      },
      // Page builder sections for drag-and-drop
      sections: { type: mongoose.Schema.Types.Mixed, default: null },
      pageStyles: {
        bgColor: { type: String, default: "#F9FAFB" },
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

    // Footer Builder Content (NEW BUILDER)
    footerBuilder: {
      blocks: { type: mongoose.Schema.Types.Mixed, default: [] },
      styles: {
        bgColor: { type: String, default: "#1F2937" },
        headingColor: { type: String, default: "#FFFFFF" },
        linkColor: { type: String, default: "#D1D5DB" },
        linkHoverColor: { type: String, default: "#FFFFFF" },
        copyrightColor: { type: String, default: "#9CA3AF" },
        dividerColor: { type: String, default: "#374151" },
      },
    },

    // Navbar Builder Content (NEW BUILDER)
    navbar: {
      blocks: { type: mongoose.Schema.Types.Mixed, default: [] },
      styles: {
        gradientFrom: { type: String, default: "#010101" },
        gradientVia: { type: String, default: "#0a1a3a" },
        gradientTo: { type: String, default: "#21AFD9" },
        textColor: { type: String, default: "#FFFFFF" },
        linkHoverColor: { type: String, default: "#3B82F6" },
        mobileMenuBg: { type: String, default: "#0F172A" },
        buttonColor: { type: String, default: "#51D96A" },
      },
    },

    // Promo Banner Content
    promo: {
      text: { type: String, default: "Get 50% OFF QuickBooks for 3 months*" },
      button: { type: String, default: "Buy now" },
      bgColor: { type: String, default: "#012549" },
      textColor: { type: String, default: "#FFFFFF" },
      buttonBgColor: { type: String, default: "#51D96A" },
      buttonTextColor: { type: String, default: "#012549" },
      buttonHoverColor: { type: String, default: "#45c55e" },
      closeButtonBgHover: { type: String, default: "rgba(255, 255, 255, 0.1)" },
    },

    // Reseller Products Content
    resellerProducts: {
      // Page builder sections for drag-and-drop
      sections: { type: mongoose.Schema.Types.Mixed, default: null },
      pageStyles: {
        bgColor: { type: String, default: "#FFFFFF" },
      },
    },

    // Trusted Partners Content
    partners: {
      title: { type: String, default: "Trusted brands trust Domainsxchange" },
      categories: {
        type: [String],
        default: ["Featured", "Tech", "Finance", "Retail"],
      },
      logos: { type: mongoose.Schema.Types.Mixed, default: {} },
      // Page builder sections for drag-and-drop
      sections: { type: mongoose.Schema.Types.Mixed, default: null },
      pageStyles: {
        bgColor: { type: String, default: "#F8F9FA" },
      },
    },

    // FAQ Content
    faq: {
      tabs: { type: [String] },
      questions: { type: Object },
      // Styling properties
      bgImage: { type: String, default: "/images/faq-bg.webp" },
      headerTitle: { type: String, default: "Frequently asked questions" },
      headerTitleColor: { type: String, default: "#FFFFFF" },
      subtitle: {
        type: String,
        default:
          "These are the most commonly asked questions about Untitled UI.",
      },
      subtitleColor: { type: String, default: "rgba(255, 255, 255, 0.9)" },
      linkText: {
        type: String,
        default: "Can't find what you're looking for?",
      },
      linkTextColor: { type: String, default: "rgba(255, 255, 255, 0.9)" },
      linkLabel: { type: String, default: "Chat to our friendly team!" },
      linkColor: { type: String, default: "#93C5FD" },
      linkHoverColor: { type: String, default: "#BFDBFE" },
      tabContainerBg: { type: String, default: "rgba(255, 255, 255, 0.2)" },
      tabActiveBg: { type: String, default: "rgba(255, 255, 255, 0.3)" },
      tabActiveText: { type: String, default: "#FFFFFF" },
      tabActiveBorder: { type: String, default: "rgba(255, 255, 255, 0.4)" },
      tabInactiveBg: { type: String, default: "rgba(255, 255, 255, 0.1)" },
      tabInactiveText: { type: String, default: "rgba(255, 255, 255, 0.8)" },
      tabInactiveBorder: { type: String, default: "rgba(255, 255, 255, 0.2)" },
      faqContainerBg: { type: String, default: "rgba(255, 255, 255, 0.2)" },
      faqContainerBorder: { type: String, default: "rgba(255, 255, 255, 0.3)" },
      questionBg: { type: String, default: "transparent" },
      questionHoverBg: { type: String, default: "rgba(255, 255, 255, 0.1)" },
      questionText: { type: String, default: "#000000" },
      questionIconBg: { type: String, default: "rgba(255, 255, 255, 0.2)" },
      questionIconBorder: { type: String, default: "rgba(255, 255, 255, 0.3)" },
      answerBg: { type: String, default: "rgba(255, 255, 255, 0.1)" },
      answerText: { type: String, default: "#000000" },
      dividerColor: { type: String, default: "rgba(255, 255, 255, 0.2)" },
      chatButtonBg: { type: String, default: "rgba(255, 255, 255, 0.2)" },
      chatButtonHoverBg: { type: String, default: "rgba(255, 255, 255, 0.3)" },
      chatButtonBorder: { type: String, default: "rgba(255, 255, 255, 0.3)" },
    },

    // Browse Domains Content
    browseDomains: {
      // Page builder sections for drag-and-drop
      sections: { type: mongoose.Schema.Types.Mixed, default: null },
      pageStyles: {
        bgColor: { type: String, default: "#0a0f1c" },
      },
    },
  },
  {
    timestamps: true,
  }
);

const Content = mongoose.model("Content", contentSchema);
export default Content;
