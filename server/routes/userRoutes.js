import express from 'express'
import { checkAuth, login, singup, udapteProfile } from '../controllers/userControllers.js'
import {protectRoute} from '../middleware/auth.js'
const userRouter = express.Router()

userRouter.post("/signup",singup)
userRouter.post("/login",login)
userRouter.put("/update-profile", protectRoute,udapteProfile)
userRouter.get("/check", protectRoute,checkAuth)

export default userRouter