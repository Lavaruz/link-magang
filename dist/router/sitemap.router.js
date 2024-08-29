"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sitemapRouter = express_1.default.Router();
sitemapRouter.get("/", function (req, res) {
    res.set('Content-Type', 'text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
        <urlset
            xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
                    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
        <!-- created with Free Online Sitemap Generator www.xml-sitemaps.com -->


        <url>
        <loc>https://internshits.com/</loc>
        <lastmod>2024-08-28T08:59:57+00:00</lastmod>
        <priority>1.00</priority>
        </url>
        <url>
        <loc>https://internshits.com/community</loc>
        <lastmod>2024-08-28T08:59:57+00:00</lastmod>
        <priority>0.80</priority>
        </url>
        <url>
        <loc>https://internshits.com/talent</loc>
        <lastmod>2024-08-28T08:59:57+00:00</lastmod>
        <priority>0.80</priority>
        </url>
        <url>
        <loc>https://internshits.com/profile/bookmark</loc>
        <lastmod>2024-08-28T08:59:57+00:00</lastmod>
        <priority>0.80</priority>
        </url>
        <url>
        <loc>https://internshits.com/posts/create</loc>
        <lastmod>2024-08-28T08:59:57+00:00</lastmod>
        <priority>0.80</priority>
        </url>
        <url>
        <loc>https://internshits.com/profile/me</loc>
        <lastmod>2024-08-28T08:59:57+00:00</lastmod>
        <priority>0.80</priority>
        </url>
        <url>
        <loc>https://internshits.com/terms-of-service</loc>
        <lastmod>2024-08-28T08:59:57+00:00</lastmod>
        <priority>0.80</priority>
        </url>
        <url>
        <loc>https://internshits.com/privacy-policy</loc>
        <lastmod>2024-08-28T08:59:57+00:00</lastmod>
        <priority>0.80</priority>
        </url>


        </urlset>`);
});
exports.default = sitemapRouter;
//# sourceMappingURL=sitemap.router.js.map