// dbConfig File
import mongoose from "mongoose";

export  const  connectDB = async()=>{
    try{
        console.log()
        const connect = await mongoose.connect(process.env.MONGO_URL)
        console.log("DATABASE is CONNECTED", connect.connection.host)
    }
    catch(err){
        console.log(err)
        process.exit(1)
    }
}