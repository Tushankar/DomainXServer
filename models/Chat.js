import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
      required: true,
    },
    resellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reseller",
      required: true,
    },
    domainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DomainListing",
      required: true,
    },
    messages: [
      {
        senderId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        senderType: {
          type: String,
          enum: ["buyer", "reseller"],
          required: true,
        },
        message: {
          type: String,
          required: true,
          trim: true,
        },
        isRead: {
          type: Boolean,
          default: false,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
chatSchema.index({ buyerId: 1, domainId: 1 });
chatSchema.index({ resellerId: 1, domainId: 1 });
chatSchema.index({ buyerId: 1, resellerId: 1, domainId: 1 }, { unique: true });
chatSchema.index({ lastMessageAt: -1 });

// Update lastMessageAt when new message is added
chatSchema.pre("save", function (next) {
  if (this.messages && this.messages.length > 0) {
    this.lastMessageAt = this.messages[this.messages.length - 1].timestamp;
  }
  next();
});

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
