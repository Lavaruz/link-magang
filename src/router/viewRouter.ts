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

export default router;
