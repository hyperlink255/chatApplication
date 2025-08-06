import { generateToken } from "../lib/utils.js";
import User from "../models/userModel.js";
import cloudinary from '../lib/cloudinary.js'
import bcrypt from 'bcrypt'

export const singup = async (req,res) => {
    const {fullName,email,password,bio} = req.body;
    try{
       if(!fullName || !email || !password || !bio){
        return res.status(401).json({success:false,message:"Missing Details"})
       }
       const user = await User.findOne({email})
       if(user){
        return res.status(401).json({success:false,message:"User already exists"})
       }

       const salt = await bcrypt.genSalt(10)
       const hashPassword = await bcrypt.hash(password,salt)

       const newUser = await User.create({
        fullName,
        email,
        password:hashPassword,
        bio,
       })

       const token = generateToken(newUser._id)
       res.status(200).json({success:true,userData:newUser,token,message:"Account created successfully"})
    
    }catch(error){
        res.status(500).json({success:false,message:error.message})
    }
}

export const login = async (req,res) => {
try{
    const {email,password} = req.body;
    const userData = await User.findOne({email})

    const isPasswordCorrect = await bcrypt.compare(password,userData.password)
    if(!isPasswordCorrect){
        return res.status(401).json({success:false,message:"Invalid credentials"})
    }
    const token = generateToken(userData._id)
    res.status(200).json({success:true,token,userData,message:"Login successful"})
}catch(error){
     res.status(500).json({success:false,message:error.message})
}

}

export const checkAuth = (req,res) => {
    res.status(200).json({success:true,user:req.user})
}

export const udapteProfile = async (req,res) => {
    try{
       const {profilePic,bio,fullName} = req.body;
       const userId = req.user._id;
       let updatedUser;
       if(!profilePic){
        updatedUser = await User.findByIdAndUpdate(userId,{bio,fullName},{new:true})
       }else{
        const upload = await cloudinary.uploader.upload(profilePic);
        updatedUser = await User.findByIdAndUpdate(userId,{profilePic:upload.secure_url,bio,fullName},{new:true})
       }
       res.status(200).json({succress:true,user:updatedUser})
    }catch(error){
     res.status(500).json({success:false,message:error.message})

    }
}