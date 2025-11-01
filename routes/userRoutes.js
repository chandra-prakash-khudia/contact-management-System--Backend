// userRoute
import express from "express"
import { getProfile, loginUser, logout, refreshToken, registerUser } from "../controllers/userController.js"
import { Validator } from "../middleware/validateTokenHandler.js"
const router = express.Router()
router.post('/register',registerUser)
router.post('/login',loginUser)
router.post('/logout', logout)
router.post("/refresh", refreshToken);

router.get('/profile',Validator, getProfile)
export default router