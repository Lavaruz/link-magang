import express, {Request, Response} from "express";
import fs from "fs"
import path from "path";
import multer from 'multer';
import cookieParser from "cookie-parser"
import cors from "cors"
import * as dotenv from "dotenv";
dotenv.config();

const app = express();





// for image upload
if (!fs.existsSync("public/files/uploads")) {
  if (!fs.existsSync("public/files")) {
    fs.mkdirSync("public/files");
  }
  if (!fs.existsSync("public/files/uploads")) {
    fs.mkdirSync("public/files/uploads");
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/files/uploads");
  },
  filename: function (req, file, cb) {
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    cb(null, Date.now() + Math.floor(Math.random() * 99) + 1 + "." + extension);
  },
});

// Router import
import { connectToDatabase } from "./models";
import viewRouter from "./router/viewRouter";
import postRouter from "./router/post.router";
import userRouter from "./router/user.router";
import sitemapRouter from "./router/sitemap.router";

app.use(cors({
  origin: "*"
}))
app.use(express.json());
app.use(cookieParser());
app.use(multer({ storage: storage, limits: { fileSize: 2097152 } }).any());
app.enable("trust proxy");
app.use(wwwRedirect);


// konfigurasi static item dalam public folder
app.use(express.static(path.join(__dirname, '../public/app')));

// konfigurasi view engine "EJS"
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// konfigurasi sequelize dengan option alter
let PORT = process.env.PORT || 8090;
connectToDatabase()
  .then(() => {
    // set router
    const VERSION_API = "v1";
    app.use(`/sitemap.xml`, sitemapRouter);
    app.use(`/api/${VERSION_API}/posts`, postRouter);
    app.use(`/api/${VERSION_API}/users`, userRouter);
    app.get('/*', (req, res) => {res.sendFile(path.join(__dirname, '../public/app/index.html'));});
    app.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Koneksi database gagal:", error);
  }
);

function wwwRedirect(req, res, next) {
  if (req.headers.host.slice(0, 4) === 'www.') {
      var newHost = req.headers.host.slice(4);
      return res.redirect(301, req.protocol + '://' + newHost + req.originalUrl);
  }
  next();
};
