"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const router = express_1.default.Router();
router.get("/", (req, res, next) => {
    try {
        return res.render("Home", { AES_KEYS: process.env.AES_KEYS });
    }
    catch (error) {
        return res.send(error);
    }
});
router.get("/profile/me", (req, res, next) => {
    try {
        return res.render("Profile", { AES_KEYS: process.env.AES_KEYS });
    }
    catch (error) {
        return res.send(error);
    }
});
router.get("/profile/bookmark", (req, res, next) => {
    try {
        return res.render("Bookmark", { AES_KEYS: process.env.AES_KEYS });
    }
    catch (error) {
        return res.send(error);
    }
});
router.get("/profile/:id", (req, res, next) => {
    try {
        return res.render("Profile-Guest", { AES_KEYS: process.env.AES_KEYS });
    }
    catch (error) {
        return res.send(error);
    }
});
router.get("/community", (req, res, next) => {
    try {
        return res.render("Community", { AES_KEYS: process.env.AES_KEYS });
    }
    catch (error) {
        return res.send(error);
    }
});
router.get("/posts/create", (req, res, next) => {
    try {
        return res.render("CreatePost", { AES_KEYS: process.env.AES_KEYS });
    }
    catch (error) {
        return res.send(error);
    }
});
router.get("/talent", (req, res, next) => {
    try {
        return res.render("Talent", { AES_KEYS: process.env.AES_KEYS });
    }
    catch (error) {
        return res.send(error);
    }
});
router.get("/privacy-policy", (req, res, next) => {
    try {
        return res.render("PrivacyPolicy");
    }
    catch (error) {
        return res.send(error);
    }
});
router.get("/terms-of-service", (req, res, next) => {
    try {
        return res.render("TermAndService");
    }
    catch (error) {
        return res.send(error);
    }
});
exports.default = router;
//# sourceMappingURL=viewRouter.js.map