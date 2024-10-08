"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("../config/crypto");
const post_controller_1 = require("../controllers/post.controller");
const express_1 = __importDefault(require("express"));
const postRouter = express_1.default.Router();
postRouter.get("/", post_controller_1.getAllPost);
postRouter.get("/internal", post_controller_1.getAllPostInternal);
postRouter.get("/partner", post_controller_1.getAllPostPartner);
postRouter.get("/match", post_controller_1.getAllMatchPost);
postRouter.get("/count", post_controller_1.getPostCount);
postRouter.get("/count-all", post_controller_1.getAllPostCount);
postRouter.get("/:id", post_controller_1.getPostById);
postRouter.post("/", decodeMiddleware, post_controller_1.addPost);
postRouter.put("/:id", decodeMiddleware, post_controller_1.updatePosts);
postRouter.delete("/", post_controller_1.DeletePost);
exports.default = postRouter;
function decodeMiddleware(req, res, next) {
    req.body = (0, crypto_1.decrypt)(req.body.d);
    if (req.body[0] == "{" || req.body[0] == "[") {
        req.body = JSON.parse(req.body);
    }
    next();
}
//# sourceMappingURL=post.router.js.map