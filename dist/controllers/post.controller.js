"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeletePost = exports.updatePosts = exports.addPost = exports.getPostCount = exports.getAllPostCount = exports.getAllPost = void 0;
const Post_1 = __importDefault(require("../models/Post"));
const crypto_1 = require("../config/crypto");
const getAllPost = async (req, res) => {
    try {
        const search = req.query.search || "";
        const post_date = req.query.post_date || "DESC";
        let platform = req.query.platform || [];
        if (platform.length !== 0) {
            platform = platform.toString().split(",");
        }
        let db_page = req.query.page || 1;
        let db_limit = req.query.limit || 20;
        const POST = await Post_1.default.findAll({
            attributes: { exclude: ["createdAt", "updatedAt"] },
            limit: +db_limit,
            offset: (+db_page - 1) * +db_limit,
            order: [["post_date", post_date.toString()]],
        });
        let filtered_data = POST.filter(post => {
            let post_json = post.toJSON();
            const matchesSearch = post_json.title.toLowerCase().includes(search.toString().toLowerCase())
                || post_json.company.toLowerCase().includes(search.toString().toLowerCase())
                || post_json.location.toLowerCase().includes(search.toString().toLowerCase())
                || post_json.tags.toLowerCase().includes(search.toString().toLowerCase());
            const matchesPlatform = platform.length !== 0 ? platform.includes(post.platform.toString().toLowerCase()) : true;
            return matchesSearch && matchesPlatform;
        });
        const total_entries = filtered_data.length;
        const total_pages = Math.ceil(total_entries / +db_limit);
        let encryptedData = (0, crypto_1.encrypt)({
            limit: db_limit,
            page: db_page,
            total_page: total_pages,
            datas: filtered_data
        }, process.env.AES_KEYS);
        return res.status(200).json(encryptedData);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
exports.getAllPost = getAllPost;
const getAllPostCount = async (req, res) => {
    try {
        const POST = await Post_1.default.count();
        return res.status(200).json(POST);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
exports.getAllPostCount = getAllPostCount;
const getPostCount = async (req, res) => {
    const platform = req.query.platform;
    try {
        const POST = await Post_1.default.count({
            where: {
                platform: platform
            }
        });
        return res.status(200).json(POST);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
exports.getPostCount = getPostCount;
const addPost = async (req, res) => {
    const postData = req.body; // Data pembaruan pengguna dari permintaan PUT  
    try {
        let POST = await Post_1.default.findOne({
            where: {
                link: postData.link
            }
        });
        if (POST) {
            return res.status(400).json({ message: "Post already exist" });
        }
        else {
            await Post_1.default.create(postData);
            return res.sendStatus(201);
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};
exports.addPost = addPost;
const updatePosts = async (req, res) => {
    const postId = req.params.id;
    const updatedPost = req.body; // Data pembaruan pengguna dari permintaan PUT  
    try {
        const post = await Post_1.default.findByPk(postId);
        if (post) {
            await post.update(updatedPost);
            return res.sendStatus(200);
        }
        else {
            return res.status(404).json({ error: "Pengguna tidak ditemukan" });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};
exports.updatePosts = updatePosts;
const DeletePost = async (req, res) => {
    const postId = req.params.id;
    const POST = await Post_1.default.findByPk(postId);
    try {
        if (POST) {
            POST.destroy();
            return res.sendStatus(200);
        }
        else {
            return res.status(404).json({ error: "Pengguna tidak ditemukan" });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};
exports.DeletePost = DeletePost;
//# sourceMappingURL=post.controller.js.map