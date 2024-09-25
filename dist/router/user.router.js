"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const crypto_1 = require("../config/crypto");
const userRouter = express_1.default.Router();
userRouter.post("/admin/login", decodeMiddleware, user_controller_1.adminLogin);
userRouter.post("/add-social-user", user_controller_1.CreateSocialUserDontHave);
userRouter.post("/add-attachment-user", user_controller_1.CreateAttachmentUserDontHave);
userRouter.get("/", user_controller_1.GetAllUsers);
userRouter.get("/active", user_controller_1.GetAllUserWhereActiveSearch);
userRouter.get("/info", user_controller_1.GetUserByToken);
userRouter.get("/info/domicile", user_controller_1.GetAllUserDomicile);
userRouter.get("/info/educations", user_controller_1.GetAllUserEducations);
userRouter.put("/info/skills", decodeMiddleware, user_controller_1.AddSkillToUser);
userRouter.put("/info/config", decodeMiddleware, user_controller_1.UpdateActiveSearch);
userRouter.get("/info/educations", user_controller_1.GetEducationsByUserToken);
userRouter.post("/info/educations", decodeMiddleware, user_controller_1.AddNewEducation);
userRouter.put("/info/educations/:id", decodeMiddleware, user_controller_1.UpdateEducationById);
userRouter.delete("/info/educations/:id", user_controller_1.DeleteEducationById);
userRouter.get("/info/experience/:id", user_controller_1.GetExperienceById);
userRouter.get("/info/experiences", user_controller_1.GetExperiencesByUserToken);
userRouter.post("/info/experiences", decodeMiddleware, user_controller_1.AddNewExperience);
userRouter.put("/info/experiences/:id", decodeMiddleware, user_controller_1.UpdateExperienceById);
userRouter.delete("/info/experiences/:id", user_controller_1.DeleteExperienceById);
userRouter.get("/skills", user_controller_1.GetAllSkills);
userRouter.get("/locations", user_controller_1.GetAllLocations);
userRouter.post("/skills", decodeMiddleware, user_controller_1.AddNewSkill);
userRouter.post("/locations", decodeMiddleware, user_controller_1.AddNewLocation);
userRouter.put("/info/attachments", decodeMiddleware, user_controller_1.UpdateAttachment);
userRouter.put("/info/socials", decodeMiddleware, user_controller_1.UpdateSocials);
userRouter.get("/verify-token", user_controller_1.VerifyJWT);
userRouter.get("/total-user", user_controller_1.GetTotalUser);
userRouter.get("/pictures", user_controller_1.GetAllProfilePicture);
userRouter.post("/logout", user_controller_1.UserLogout);
userRouter.post("/auth/google", decodeMiddleware, user_controller_1.GoogleLoginHandler);
userRouter.put("/", decodeMiddleware, user_controller_1.UpdateUserByToken);
userRouter.get("/:id", user_controller_1.GetUserById);
userRouter.put("/:id/views", user_controller_1.AddViewsUser);
function decodeMiddleware(req, res, next) {
    req.body = (0, crypto_1.decrypt)(req.body.d);
    if (req.body[0] == "{" || req.body[0] == "[") {
        req.body = JSON.parse(req.body);
    }
    next();
}
exports.default = userRouter;
//# sourceMappingURL=user.router.js.map