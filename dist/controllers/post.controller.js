"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeletePost = exports.updatePosts = exports.addPost = exports.getPostCount = exports.getAllPostCount = exports.getPostById = exports.getAllMatchPost = exports.getAllPost = void 0;
const Post_1 = __importDefault(require("../models/Post"));
const crypto_1 = require("../config/crypto");
const Skills_1 = __importDefault(require("../models/Skills"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const sequelize_1 = require("sequelize");
const getAllPost = async (req, res) => {
    try {
        const search = req.query.search || "";
        const post_date = req.query.post_date || "DESC";
        let skills = req.query.skills || "";
        let type = req.query.type || "";
        let locations = req.query.locations || "";
        let db_page = req.query.page || 1;
        let db_limit = req.query.limit || 20;
        let db_offset = req.query.offset;
        locations = locations.length > 0 ? locations.split(";") : [];
        type = type.length > 0 ? type.split(";") : [];
        skills = skills.length > 0 ? skills.split(";") : [];
        const POST = await Post_1.default.findAndCountAll({
            attributes: { exclude: ["updatedAt"] },
            limit: +db_limit,
            offset: +db_offset || (+db_page - 1) * +db_limit,
            distinct: true,
            order: [["post_date", post_date.toString()]],
            where: {
                ...(type.length > 0 ? { type: { [sequelize_1.Op.in]: type } } : {}),
                ...(locations.length > 0 ? { location: { [sequelize_1.Op.in]: locations } } : {}),
                [sequelize_1.Op.or]: [
                    { title: { [sequelize_1.Op.like]: `%${search}%` } },
                    { company: { [sequelize_1.Op.like]: `%${search}%` } },
                ]
            },
            include: [
                { model: Skills_1.default, as: "skills", where: {
                        ...(skills.length > 0 ? { skill: { [sequelize_1.Op.in]: skills } } : {})
                    } },
            ]
        });
        const total_pages = Math.ceil(POST.count / +db_limit);
        let encryptedData = (0, crypto_1.encrypt)({
            limit: db_limit,
            page: db_page,
            total_page: total_pages,
            datas: POST.rows,
            total_entries: POST.count
        }, process.env.AES_KEYS);
        return res.status(200).json(encryptedData);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
exports.getAllPost = getAllPost;
const getAllMatchPost = async (req, res) => {
    const search = req.query.search || "";
    const post_date = req.query.post_date || "DESC";
    let db_page = req.query.page || 1;
    let db_limit = req.query.limit || 20;
    try {
        const userAuth = req.headers.authorization;
        try {
            jsonwebtoken_1.default.verify(userAuth, process.env.ACCESS_TOKEN_SECRET, async function (err, user) {
                // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
                if (err)
                    return res.status(400).json(err.message);
                const USER = await User_1.default.findByPk(user.id);
                if (!USER)
                    return res.status(404).json({ message: "user not found" });
                const SKILLS = await USER.getSkills();
                const skillNames = SKILLS.map(skill => skill.dataValues.skill);
                const POST = await Post_1.default.findAndCountAll({
                    attributes: { exclude: ["updatedAt"] },
                    limit: +db_limit,
                    offset: (+db_page - 1) * +db_limit,
                    distinct: true,
                    order: [["post_date", post_date.toString()]],
                    where: {
                        [sequelize_1.Op.or]: [
                            { title: { [sequelize_1.Op.like]: `%${search}%` } },
                            { company: { [sequelize_1.Op.like]: `%${search}%` } },
                        ]
                    },
                    include: [
                        {
                            model: Skills_1.default,
                            as: "skills",
                            where: {
                                skill: { [sequelize_1.Op.in]: skillNames }, // Filter langsung pada skills sesuai skillNames
                            },
                        }
                    ]
                });
                const total_entries = POST.count;
                const total_pages = Math.ceil(total_entries / +db_limit);
                let encryptedData = (0, crypto_1.encrypt)({
                    limit: db_limit,
                    page: db_page,
                    total_page: total_pages,
                    datas: POST.rows,
                    total_entries: POST.count
                }, process.env.AES_KEYS);
                return res.status(200).json(encryptedData);
            });
        }
        catch (error) {
            console.error(error);
            return res.status(200).json({ message: error.message });
        }
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
exports.getAllMatchPost = getAllMatchPost;
const getPostById = async (req, res) => {
    const postId = req.params.id;
    try {
        const POST = await Post_1.default.findByPk(postId, {
            include: [
                { model: Skills_1.default, as: "skills" }
            ]
        });
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
    const skillBody = req.body.skills.split(";");
    try {
        let POST = await Post_1.default.findOne({ where: { link: postData.link } });
        if (POST)
            return res.status(400).json({ message: "Post already exist" });
        const NEW_POST = await Post_1.default.create(postData);
        const SKILLS = await Skills_1.default.findAll({ where: { id: skillBody } });
        await NEW_POST.setSkills(SKILLS);
        return res.status(201).json({ message: "success adding new post" });
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
    let postId = req.query.ids || "";
    postId = postId.split(";");
    try {
        const POST = await Post_1.default.findAll({ where: { id: postId } });
        if (POST.length > 0) {
            POST.forEach(async (post) => { await post.destroy(); });
            return res.status(200).json({ message: "succes delete post" });
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