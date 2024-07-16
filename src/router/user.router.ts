import express from "express";
import { AddNewEducation, AddNewExperience, AddNewSkill, AddSkillToUser, DeleteEducationById, DeleteExperienceById, GetAllSkills, GetEducationsByUserToken, GetExperienceById, GetExperiencesByUserToken, GetTotalUser, GetUserByToken, GoogleLoginHandler, UpdateAttachment, UpdateEducationById, UpdateExperienceById, UpdateSocials, UpdateUserByToken, UserLogout, VerifyJWT } from "../controllers/user.controller";
    
const userRouter = express.Router();

userRouter.get("/info", GetUserByToken)

userRouter.post("/info/skills", AddSkillToUser)

userRouter.get("/info/educations", GetEducationsByUserToken)
userRouter.post("/info/educations", AddNewEducation)
userRouter.put("/info/educations/:id", UpdateEducationById)
userRouter.delete("/info/educations/:id", DeleteEducationById)

userRouter.get("/info/experience/:id", GetExperienceById)
userRouter.get("/info/experiences", GetExperiencesByUserToken)
userRouter.post("/info/experiences", AddNewExperience)
userRouter.put("/info/experiences/:id", UpdateExperienceById)
userRouter.delete("/info/experiences/:id", DeleteExperienceById)


userRouter.get("/skills", GetAllSkills)
userRouter.post("/skills", AddNewSkill)

userRouter.put("/info/attachments", UpdateAttachment)
userRouter.put("/info/socials", UpdateSocials)

userRouter.get("/verify-token", VerifyJWT)
userRouter.get("/total-user", GetTotalUser)
userRouter.post("/logout", UserLogout)
userRouter.post("/auth/google", GoogleLoginHandler)
userRouter.put("/", UpdateUserByToken)
    
export default userRouter;
    