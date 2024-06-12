import { getAllPost, updatePosts, DeletePost, addPost, getAllPostCount, getThreePost } from "../controllers/post.controller";
import express from "express";
    
const postRouter = express.Router();

postRouter.get("/", getAllPost)
postRouter.get("/three", getThreePost)
postRouter.get("/count", getAllPostCount)
postRouter.post("/", addPost)
postRouter.put("/:id", updatePosts)
postRouter.delete("/:id", DeletePost)
    
export default postRouter;
    