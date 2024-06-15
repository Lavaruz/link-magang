"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const userRouter = express_1.default.Router();
userRouter.get("/verify-token", user_controller_1.VerifyJWT);
userRouter.get("/total-user", user_controller_1.GetTotalUser);
userRouter.put("/", user_controller_1.UpdateUser);
exports.default = userRouter;
//# sourceMappingURL=user.router.js.map