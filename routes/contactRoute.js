import express from "express"
import { createContact, deleteContact, getContact, getContacts, updateContact } from "../controllers/contactController.js";
import { Validator } from "../middleware/validateTokenHandler.js";

const router = express.Router();
router.use(Validator)
router.get("/" ,getContacts )
router.post("/" ,createContact )
router.put("/:id" ,updateContact )
router.get("/:id" , getContact)
router.delete("/:id" , deleteContact
)
 export default router