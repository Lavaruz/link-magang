"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const app = (0, express_1.default)();
// for image upload
if (!fs_1.default.existsSync("public/files/uploads")) {
    if (!fs_1.default.existsSync("public/files")) {
        fs_1.default.mkdirSync("public/files");
    }
    if (!fs_1.default.existsSync("public/files/uploads")) {
        fs_1.default.mkdirSync("public/files/uploads");
    }
}
const storage = multer_1.default.diskStorage({
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
const models_1 = require("./models");
const post_router_1 = __importDefault(require("./router/post.router"));
const user_router_1 = __importDefault(require("./router/user.router"));
const sitemap_router_1 = __importDefault(require("./router/sitemap.router"));
app.use((0, cors_1.default)({
    origin: "*"
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, multer_1.default)({ storage: storage, limits: { fileSize: 2097152 } }).any());
app.enable("trust proxy");
app.use(wwwRedirect);
// konfigurasi static item dalam public folder
app.use(express_1.default.static(path_1.default.join(__dirname, '../public/app')));
// konfigurasi view engine "EJS"
app.set("view engine", "ejs");
app.set("views", path_1.default.join(__dirname, "../views"));
// konfigurasi sequelize dengan option alter
let PORT = process.env.PORT || 8090;
(0, models_1.connectToDatabase)()
    .then(() => {
    // set router
    const VERSION_API = "v1";
    app.use(`/sitemap.xml`, sitemap_router_1.default);
    app.use(`/api/${VERSION_API}/posts`, post_router_1.default);
    app.use(`/api/${VERSION_API}/users`, user_router_1.default);
    app.get('/*', (req, res) => { res.sendFile(path_1.default.join(__dirname, '../public/app/index.html')); });
    app.listen(PORT, () => {
        console.log(`Server berjalan di http://localhost:${PORT}`);
    });
})
    .catch((error) => {
    console.error("Koneksi database gagal:", error);
});
function wwwRedirect(req, res, next) {
    if (req.headers.host.slice(0, 4) === 'www.') {
        var newHost = req.headers.host.slice(4);
        return res.redirect(301, req.protocol + '://' + newHost + req.originalUrl);
    }
    next();
}
;
//# sourceMappingURL=server.js.map