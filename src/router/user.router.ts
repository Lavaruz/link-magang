import express from "express";
import { GetTotalUser, UpdateUser, VerifyJWT } from "../controllers/user.controller";
    
const userRouter = express.Router();

userRouter.get("/verify-token", VerifyJWT)
userRouter.get("/total-user", GetTotalUser)
userRouter.put("/", UpdateUser)
    
export default userRouter;
    