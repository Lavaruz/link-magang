import express from "express";
import { AddNewExperience, GetEducationsByUserToken, GetExperiencesByUserToken, GetTotalUser, GetUserByToken, GoogleLoginHandler, UpdateAttachment, UpdateUserByToken, VerifyJWT } from "../controllers/user.controller";
    
const userRouter = express.Router();

userRouter.get("/info", GetUserByToken)

userRouter.get("/info/educations", GetEducationsByUserToken)
userRouter.post("/info/educations", GetEducationsByUserToken)
userRouter.get("/info/experiences", GetExperiencesByUserToken)
userRouter.post("/info/experiences", AddNewExperience)


userRouter.put("/info/attachments", UpdateAttachment)

userRouter.get("/verify-token", VerifyJWT)
userRouter.get("/total-user", GetTotalUser)
userRouter.post("/auth/google", GoogleLoginHandler)
userRouter.put("/", UpdateUserByToken)
    
export default userRouter;
    