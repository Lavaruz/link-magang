import express, {Response, Request} from "express";
import { sign, verify } from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

const router = express.Router();



router.get("/", (req: Request, res: Response, next) => {
  try {
    return res.render("Home")
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

export default router;
