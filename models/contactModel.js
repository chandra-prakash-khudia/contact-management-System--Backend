// contactModel
import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    user_id:{
      type: mongoose.Schema.ObjectId,
      required : true,
      ref :"User",
    },
    name: {
      type: String,
      required: [true, "Please add the name"],
    },
    email: {
      type: String,
      required: [true, "Please add the email"],
    },
    phone: {
      type: String,
      required: [true, "Please add the phone number"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Contact", contactSchema);
