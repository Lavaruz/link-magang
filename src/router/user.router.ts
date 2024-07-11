import express from "express";
import { GetTotalUser, GetUserByToken, GoogleLoginHandler, UpdateUser, VerifyJWT } from "../controllers/user.controller";
import { decryptAES } from "../config/middleware";
    
const userRouter = express.Router();

userRouter.get("/info", GetUserByToken)
userRouter.get("/verify-token", VerifyJWT)
userRouter.get("/total-user", GetTotalUser)
userRouter.post("/auth/google", decryptAES, GoogleLoginHandler)
userRouter.put("/", UpdateUser)
    
export default userRouter;
    