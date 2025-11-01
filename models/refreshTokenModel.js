// models/refreshTokenModel.js
import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, unique: true }, // hash of the token
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    createdByIp: { type: String },
    revokedAt: { type: Date, default: null },
    revokedByIp: { type: String, default: null },
    replacedByTokenHash: { type: String, default: null }, // hash of new token when rotated
    deviceInfo: { type: String, default: null }, // optional: user-agent/device name
  },
  {
    timestamps: true,
  }
);

// Optional: TTL index to auto-remove expired docs (mongodb background job)
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("RefreshToken", refreshTokenSchema);
