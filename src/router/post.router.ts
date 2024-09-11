import { getAllPost, updatePosts, DeletePost, addPost, getAllPostCount, getPostCount, getPostById, getAllMatchPost } from "../controllers/post.controller";
import express from "express";
    
const postRouter = express.Router();

postRouter.get("/", getAllPost)
postRouter.get("/match", getAllMatchPost)
postRouter.get("/count", getPostCount)
postRouter.get("/count-all", getAllPostCount)
postRouter.get("/:id", getPostById)
postRouter.post("/", addPost)
postRouter.put("/:id", updatePosts)
postRouter.delete("/:id", DeletePost)
    
export default postRouter;
    