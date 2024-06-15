"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUser = exports.GetTotalUser = exports.VerifyJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
function VerifyJWT(req, res) {
    const accessToken = req.cookies["access-token"];
    try {
        if (!accessToken)
            return res.status(400).json({ message: "access token doesn't exist" });
        // if(!accessToken) return res.status(400).send(false)
        jsonwebtoken_1.default.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async function (err, _) {
            if (err)
                return res.status(400).json({ message: "Unauthorized, refresh token invalid" });
            // if(err) return res.status(400).send(false)
            return res.status(200).json({ accessToken });
            // return res.status(200).send(true)
        });
    }
    catch (error) {
    }
}
exports.VerifyJWT = VerifyJWT;
async function GetTotalUser(req, res) {
    try {
        const TOTAL_USER = await User_1.default.count();
        return res.status(200).json(TOTAL_USER);
    }
    catch (error) {
        console.error(error);
        return res.status(200).json({ message: error.message });
    }
}
exports.GetTotalUser = GetTotalUser;
async function UpdateUser(req, res) {
    const userData = req.body;
    try {
        if (!userData.email)
            return res.status(400).json({ message: "email is required" });
        const USER = await User_1.default.findOne({ where: { email: userData.email } });
        if (!USER)
            return res.status(404).json({ message: "user not found" });
        USER.update(userData);
        return res.sendStatus(200);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}
exports.UpdateUser = UpdateUser;
//# sourceMappingURL=user.controller.js.map