"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeletePost = exports.updatePosts = exports.addPost = exports.getPostCount = exports.getAllPostCount = exports.getPostById = exports.getAllPost = void 0;
const Post_1 = __importDefault(require("../models/Post"));
const crypto_1 = require("../config/crypto");
const Skills_1 = __importDefault(require("../models/Skills"));
const getAllPost = async (req, res) => {
    try {
        const search = req.query.search || "";
        const post_date = req.query.post_date || "DESC";
        let skills = req.query.skills;
        let type = req.query.type;
        let locations = req.query.locations;
        let db_page = req.query.page || 1;
        let db_limit = req.query.limit || 20;
        locations = JSON.parse(locations);
        type = JSON.parse(type);
        skills = JSON.parse(skills);
        if (search !== "" || locations.length > 0 || skills.length > 0 || type.length > 0) {
            db_limit = 999;
        }
        const POST = await Post_1.default.findAll({
            attributes: { exclude: ["updatedAt"] },
            limit: +db_limit,
            offset: (+db_page - 1) * +db_limit,
            order: [["createdAt", post_date.toString()]],
            include: [
                { model: Skills_1.default, as: "skills" },
            ]
        });
        let filtered_data = POST.filter(post => {
            let post_json = post.toJSON();
            const matchesSearch = post_json.title.toLowerCase().includes(search.toString().toLowerCase()) || post_json.company.toLowerCase().includes(search.toString().toLowerCase());
            let matchesLocation = true;
            if (locations.length > 0) {
                matchesLocation = locations.includes(post_json.location.toLowerCase());
            }
            let matchesType = true;
            if (type.length > 0) {
                matchesType = type.includes(post_json.type.toLowerCase());
            }
            let matchesSkills = true;
            if (skills.length > 0) {
                const postSkills = post_json.skills.map(skill => skill.skill.toLowerCase());
                matchesSkills = skills.some(skill => postSkills.includes(skill.toLowerCase()));
            }
            return matchesSearch && matchesLocation && matchesSkills && matchesType;
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
const getPostById = async (req, res) => {
    const postId = req.params.id;
    try {
        const POST = await Post_1.default.findByPk(postId);
        const encryptedData = (0, crypto_1.encrypt)(POST);
        return res.status(200).json(encryptedData);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
exports.getPostById = getPostById;
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
    const skillBody = req.body.skills;
    try {
        let POST = await Post_1.default.findOne({ where: { link: postData.link } });
        if (POST)
            return res.status(400).json({ message: "Post already exist" });
        const NEW_POST = await Post_1.default.create(postData);
        const SKILLS = await Skills_1.default.findAll({ where: { id: skillBody } });
        await NEW_POST.setSkills(SKILLS);
        return res.sendStatus(201);
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