import { decrypt } from "../config/crypto";
import { getAllPost, updatePosts, DeletePost, addPost, getAllPostCount, getPostCount, getPostById, getAllMatchPost, getAllPostInternal, getAllPostPartner, getAllPostMacthSkill } from "../controllers/post.controller";
import express from "express";
    
const postRouter = express.Router();

postRouter.get("/", getAllPost)
postRouter.get("/skills", getAllPostMacthSkill)
postRouter.get("/internal", getAllPostInternal)
postRouter.get("/partner", getAllPostPartner)
postRouter.get("/match", getAllMatchPost)
postRouter.get("/count", getPostCount)
postRouter.get("/count-all", getAllPostCount)
postRouter.get("/:id", getPostById)
postRouter.post("/", decodeMiddleware, addPost)
postRouter.put("/:id", decodeMiddleware, updatePosts)
postRouter.delete("/", DeletePost)
    
export default postRouter;

function decodeMiddleware(req, res, next){
    req.body = decrypt(req.body.d)
    if(req.body[0] == "{" || req.body[0] == "["){
        req.body = JSON.parse(req.body)
    }
    next()
}
    