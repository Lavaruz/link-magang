import express, {Request, Response} from "express";
import fs from "fs"
import path from "path";
import multer from 'multer';
import cookieParser from "cookie-parser"
import cors from "cors"
import passport from "passport";
import {Strategy as GoogleStrategy} from "passport-google-oauth20"
import * as dotenv from "dotenv";
import { createToken } from "./config/JWT";
import User from "./models/User"
dotenv.config();

const app = express();

// Konfigurasi Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `/api/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
  // Lakukan sesuatu dengan data profil pengguna, seperti menyimpan di database
  const email = profile.emails![0].value;

  if (!email) throw new Error('Login failed');

  const existingUser = await User.findOne({where: {email}});
  
  if(existingUser){
    const accessToken = createToken(existingUser);
    Object.assign(profile, {accessToken})
    return done(null, profile);
  }else{
    let USER = await User.create({
      email: email,
      profile_picture: profile.photos[0].value,
      name: profile.name.givenName,
    })
    const accessToken = createToken(USER);
    Object.assign(profile, {accessToken})
    return done(null, profile);
  }
}));

app.use(passport.initialize());

app.get('/api/google',passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/api/google/callback',
  passport.authenticate('google', { failureRedirect: '/' , session: false}),
  (req:Request, res: Response) => {
    // Di sini, Anda dapat mengarahkan pengguna atau melakukan sesuatu setelah otentikasi sukses
    res.cookie("access-token", req.user.accessToken, {
      maxAge: 360000000,
    });
    return res.redirect("/")
  }
);








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
app.use("/", express.static(path.join(__dirname, "../public")));

// konfigurasi view engine "EJS"
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// konfigurasi sequelize dengan option alter
let PORT = process.env.PORT || 8090;
connectToDatabase()
  .then(() => {
    // set router
    const VERSION_API = "v1";
    app.use("/", viewRouter);
    app.use(`/sitemap.xml`, sitemapRouter);
    app.use(`/api/${VERSION_API}/posts`, postRouter);
    app.use(`/api/${VERSION_API}/users`, userRouter);
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
