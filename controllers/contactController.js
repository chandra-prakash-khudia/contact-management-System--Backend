// contactController
import contactSchema from "../models/contactModel.js";
import mongoose from "mongoose";
export const getContacts = async (req, res) => {
  const contact = await contactSchema.find({ user_id: req.user.id });
  // res.status(200).json({message:"Get All contact"})
  res.status(200).json(contact);
};

export const createContact = async (req, res) => {
  console.log("console", req.body);
  const { name, email, phone } = req.body;
  const check = await contactSchema.find({ name });
  if (!check) {
    res.status(400);
    throw new Error("User allready exist");
  }
  if (!name || !email || !phone) {
    res.status(400);
    throw new Error("All Fields are Required");
  }
  const contact = await contactSchema.create({
    name,
    email,
    phone,
    user_id: req.user.id,
  });
  res.status(200).json({ message: "createContact contact" });
};

export const updateContact = async (req, res) => {
  const contact = await contactSchema.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error("Contact not Found");
  }
  if (contact.user_id.toString() !== req.user.id) {
    res.status(401);
    throw new Error("different User is trying to Access the token");
  }
  const updatedContact = await contactSchema.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.status(200).json({ updatedContact });
};

export const getContact = async (req, res) => {
  const contact = await contactSchema.findById(req.params.id);
  console.log(req.params.id)
  if (!contact) {
    res.status(404);
    throw new Error("contact does not  exist");
  }
  res.status(200).json(contact);
};

export const deleteContact = async (req, res) => {
    const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    res.status(400);
    throw new Error("Invalid contact id");
  }

  const contact = await contactSchema.findById(id);
  if (!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }

  if (contact.user_id.toString() !== req.user.id) {
    res.status(403);
    throw new Error("You do not have permission to delete this contact");
  }

  // Actually delete
  await contactSchema.findByIdAndDelete(id);

  return res.status(200).json({ message: "Contact deleted", id });


};
