import express from "express";
import { AddNewEducation, AddNewExperience, AddNewLocation, AddNewSkill, AddSkillToUser, AddViewsUser, DeleteEducationById, DeleteExperienceById, GetAllLocations, GetAllProfilePicture, GetAllSkills, GetAllUserDomicile, GetAllUserEducations, GetAllUserWhereActiveSearch, GetEducationsByUserToken, GetExperienceById, GetExperiencesByUserToken, GetTotalUser, GetUserById, GetUserByToken, GoogleLoginHandler, UpdateActiveSearch, UpdateAttachment, UpdateEducationById, UpdateExperienceById, UpdateSocials, UpdateUserByToken, UserLogout, VerifyJWT } from "../controllers/user.controller";
import { decrypt } from "../config/crypto";    

const userRouter = express.Router();

userRouter.get("/active", GetAllUserWhereActiveSearch)
userRouter.get("/info", GetUserByToken)
userRouter.get("/info/domicile", GetAllUserDomicile)
userRouter.get("/info/educations", GetAllUserEducations)

userRouter.post("/info/skills", AddSkillToUser)
userRouter.put("/info/config", UpdateActiveSearch)

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
userRouter.get("/locations", GetAllLocations)
userRouter.post("/skills", AddNewSkill)
userRouter.post("/locations", AddNewLocation)

userRouter.put("/info/attachments", UpdateAttachment)
userRouter.put("/info/socials", UpdateSocials)

userRouter.get("/verify-token", VerifyJWT)
userRouter.get("/total-user", GetTotalUser)
userRouter.get("/pictures", GetAllProfilePicture)
userRouter.post("/logout", UserLogout)
userRouter.post("/auth/google", decodeMiddleware, GoogleLoginHandler)
userRouter.put("/", UpdateUserByToken)

userRouter.get("/:id", GetUserById)
userRouter.put("/:id/views", AddViewsUser)


function decodeMiddleware(req, res, next){
    req.body = decrypt(req.body.d)
    next()
}
    
export default userRouter;
    