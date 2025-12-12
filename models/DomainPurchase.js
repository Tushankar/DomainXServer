import mongoose from "mongoose";

const domainPurchaseSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
      required: true,
    },
    domain: {
      type: String,
      required: true,
      lowercase: true,
    },
    sld: String,
    tld: String,
    orderNumber: {
      type: String,
      unique: true,
    },
    purchasePrice: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    domainStatus: {
      type: String,
      enum: ["pending", "active", "expired", "cancelled"],
      default: "pending",
    },
    expirationDate: Date,
    autoRenewal: {
      type: Boolean,
      default: false,
    },
    dnsRecords: [
      {
        recordType: {
          type: String,
          enum: ["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SRV"],
          required: true,
        },
        name: {
          type: String,
          default: "@",
        },
        value: {
          type: String,
          required: true,
        },
        ttl: {
          type: Number,
          default: 3600,
        },
        priority: Number,
      },
    ],
    defaultNameservers: [String],
    nameserverSetupCompleted: {
      type: Boolean,
      default: false,
    },
    paymentDate: Date,
    transactionId: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
domainPurchaseSchema.index({ buyerId: 1, createdAt: -1 });
domainPurchaseSchema.index({ domain: 1 });
domainPurchaseSchema.index({ orderNumber: 1 });
domainPurchaseSchema.index({ paymentStatus: 1 });

const DomainPurchase = mongoose.model("DomainPurchase", domainPurchaseSchema);

export default DomainPurchase;
