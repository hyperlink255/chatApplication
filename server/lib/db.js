import mongoose from "mongoose";

const connectDB = async () => {
    try{
      await mongoose.connect(process.env.MONGO_URL)
      console.log("Connect To Db")
    }catch(err){
      console.log("Not Connect")
    }
}

export default connectDB