import express, {Response, Request} from "express";
import { sign, verify } from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

const router = express.Router();



router.get("/", (req: Request, res: Response, next) => {
  try {
    return res.render("Home", {AES_KEYS: process.env.AES_KEYS})
  } catch (error) {
    return res.send(error);
  }
});

router.get("/profile/me", (req: Request, res: Response, next) => {
  try {
    return res.render("Profile", {AES_KEYS: process.env.AES_KEYS})
  } catch (error) {
    return res.send(error);
  }
});

router.get("/profile/bookmark", (req: Request, res: Response, next) => {
  try {
    return res.render("Bookmark", {AES_KEYS: process.env.AES_KEYS})
  } catch (error) {
    return res.send(error);
  }
});

router.get("/community", (req: Request, res: Response, next) => {
  try {
    return res.render("Community", {AES_KEYS: process.env.AES_KEYS})
  } catch (error) {
    return res.send(error);
  }
});

router.get("/posts/create", (req: Request, res: Response, next) => {
  try {
    return res.render("CreatePost", {AES_KEYS: process.env.AES_KEYS})
  } catch (error) {
    return res.send(error);
  }
});

router.get("/market", (req: Request, res: Response, next) => {
  try {
    return res.render("Market", {AES_KEYS: process.env.AES_KEYS})
  } catch (error) {
    return res.send(error);
  }
});

router.get("/create", (req: Request, res: Response, next) => {
  try {
    return res.render("Create")
  } catch (error) {
    return res.send(error);
  }
});

router.get("/privacy-policy", (req: Request, res: Response, next) => {
  try {
    return res.render("PrivacyPolicy")
  } catch (error) {
    return res.send(error);
  }
});

router.get("/terms-of-service", (req: Request, res: Response, next) => {
  try {
    return res.render("TermAndService")
  } catch (error) {
    return res.send(error);
  }
});

export default router;
