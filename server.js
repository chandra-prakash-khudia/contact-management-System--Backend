import express from "express"
import dotenv from "dotenv"
import contactRoute from "./routes/contactRoute.js"
import { errorHandler } from "./middleware/errorhandler.js"
import  {connectDB}  from "./config/dbConnection.js"
import cookieParser from "cookie-parser";


import userRoute from "./routes/userRoutes.js"
dotenv.config(); 
connectDB()
const app = express()

const PORT = process.env.PORT || 3000 
app.use(cookieParser());
app.use(express.json())
app.use("/api/contacts/", contactRoute)
app.use("/api/auth/", userRoute)
app.use(errorHandler)
// app.get("/api/contacts" , (req,res) =>{
//     res.status(201).json({message:"get all Contact"})
// })
app.listen(PORT  , ()=>{
    `Server is running on Port ${PORT}`
})