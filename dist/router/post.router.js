"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const post_controller_1 = require("../controllers/post.controller");
const express_1 = __importDefault(require("express"));
const postRouter = express_1.default.Router();
postRouter.get("/", post_controller_1.getAllPost);
postRouter.get("/count", post_controller_1.getPostCount);
postRouter.get("/count-all", post_controller_1.getAllPostCount);
postRouter.get("/:id", post_controller_1.getPostById);
postRouter.post("/", post_controller_1.addPost);
postRouter.put("/:id", post_controller_1.updatePosts);
postRouter.delete("/:id", post_controller_1.DeletePost);
exports.default = postRouter;
//# sourceMappingURL=post.router.js.map