"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeImageRouter = exports.CreateAttachmentUserDontHave = exports.CreateSocialUserDontHave = exports.UpdateActiveSearch = exports.GetAllProfilePicture = exports.UpdateSocials = exports.UpdateAttachment = exports.AddNewLocation = exports.GetAllUserDomicile = exports.GetAllLocations = exports.AddSkillToUser = exports.AddNewSkill = exports.GetAllSkills = exports.DeleteEducationById = exports.UpdateEducationById = exports.GetAllUserEducations = exports.AddNewEducation = exports.DeleteExperienceById = exports.AddNewExperience = exports.GetExperienceById = exports.UpdateExperienceById = exports.GetExperiencesByUserToken = exports.GetEducationsByUserToken = exports.GoogleLoginHandler = exports.UpdateUserByToken = exports.GetTotalUser = exports.GetUserByToken = exports.AddViewsUser = exports.GetUserById = exports.GetAllUserWhereActiveSearch = exports.GetAllUsers = exports.UserLogout = exports.adminLogin = exports.VerifyJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const JWT_1 = require("../config/JWT");
const crypto_1 = require("../config/crypto");
const jwt_decode_1 = require("jwt-decode");
const UserExperience_1 = __importDefault(require("../models/UserExperience"));
const UserEducation_1 = __importDefault(require("../models/UserEducation"));
const UserAttachment_1 = __importDefault(require("../models/UserAttachment"));
const UserSocial_1 = __importDefault(require("../models/UserSocial"));
const Skills_1 = __importDefault(require("../models/Skills"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const UserConfig_1 = __importDefault(require("../models/UserConfig"));
const Locations_1 = __importDefault(require("../models/Locations"));
const sequelize_1 = require("sequelize");
const Mailer_1 = __importDefault(require("../config/Mailer"));
function VerifyJWT(req, res) {
    const accessToken = req.headers.authorization;
    try {
        if (!accessToken)
            return res.status(200).send(false);
        jsonwebtoken_1.default.verify(accessToken.toString(), process.env.ACCESS_TOKEN_SECRET, async function (err, _) {
            if (err)
                return res.status(200).send(false);
            return res.status(200).json(true);
        });
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: error.message });
    }
}
exports.VerifyJWT = VerifyJWT;
function adminLogin(req, res) {
    const adminCredentials = req.body.credentials;
    try {
        if (!adminCredentials)
            return res.status(400).send("not autorized");
        if (adminCredentials == process.env.ADMIN_CREDENTIALS) {
            return res.status(200).json({ message: "Success login admin" });
        }
        else {
            return res.status(400).json({ message: "Who are you?" });
        }
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: error.message });
    }
}
exports.adminLogin = adminLogin;
function UserLogout(req, res) {
    try {
        res.clearCookie("userAuthenticate");
        res.redirect("/");
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
exports.UserLogout = UserLogout;
async function GetAllUsers(req, res) {
    let keyword = req.query.keyword ? req.query.keyword : "";
    let university = req.query.university || "[]";
    let edu_type = req.query.edu_type || "";
    let work_pref = req.query.work_pref || "";
    let gpa = req.query.gpa || "";
    let gender = req.query.gender || "";
    let db_page = req.query.page || 1;
    let db_limit = req.query.limit || 20;
    let db_offset = req.query.offset;
    try {
        const USERS = await User_1.default.findAll({
            limit: +db_limit,
            offset: +db_offset || (+db_page - 1) * +db_limit,
            include: [
                {
                    model: UserExperience_1.default,
                    as: "experiences",
                    order: [
                        [sequelize_1.Sequelize.literal('CASE WHEN `exp_enddate` IS NULL THEN 1 ELSE 0 END'), 'DESC'],
                        ['exp_enddate', 'DESC']
                    ]
                },
                {
                    model: UserEducation_1.default,
                    as: "educations",
                    order: [
                        [sequelize_1.Sequelize.literal('CASE WHEN `edu_enddate` IS NULL THEN 1 ELSE 0 END'), 'DESC'],
                        ['edu_enddate', 'DESC']
                    ]
                },
                {
                    model: UserAttachment_1.default,
                    as: "attachments"
                },
                {
                    model: UserSocial_1.default,
                    as: "socials"
                },
                {
                    model: Skills_1.default,
                    as: "skills"
                },
                {
                    model: UserConfig_1.default,
                    as: "config"
                }
            ]
        });
        const USER_COUNT = await User_1.default.count();
        const updatedUsers = await Promise.all(USERS.map(async (user) => {
            const userExperience = user.toJSON().experiences;
            const YoE = calculateTotalExperienceMonth(userExperience);
            return {
                ...user.toJSON(),
                YoE: YoE
            };
        }));
        const encryptedData = (0, crypto_1.encrypt)({
            total_entries: USER_COUNT,
            datas: updatedUsers
        });
        return res.status(200).json(encryptedData);
    }
    catch (error) {
        console.error(error);
        return res.status(200).json({ message: error.message });
    }
}
exports.GetAllUsers = GetAllUsers;
async function GetAllUserWhereActiveSearch(req, res) {
    let search_person = req.query.search_person ? req.query.search_person : "";
    let db_page = req.query.page || 1;
    let db_limit = req.query.limit || 20;
    let db_offset = db_limit * (db_page - 1);
    let gender = req.query.gender || "";
    let work_pref = req.query.work_pref || "";
    let institute = req.query.institute || "";
    let edu_type = req.query.edu_type || "";
    let gpa = req.query.gpa || "";
    gender = gender.length > 0 ? gender.split(";") : [];
    work_pref = work_pref.length > 0 ? work_pref.split(";") : [];
    institute = institute.length > 0 ? institute.split(";") : [];
    edu_type = edu_type.length > 0 ? edu_type.split(";") : [];
    gpa = gpa.length > 0 ? gpa.split(";") : [];
    try {
        const USERS = await User_1.default.findAll({
            // limit: +db_limit,
            // offset: +db_offset || (+db_page - 1) * +db_limit,
            // subQuery: false,
            where: {
                active_search: true,
                ...(gender.length > 0 ? { sex: { [sequelize_1.Op.in]: gender } } : {}),
                ...(work_pref.length > 0 ? { work_pref_status: { [sequelize_1.Op.in]: work_pref } } : {}),
                [sequelize_1.Op.or]: [
                    { firstname: { [sequelize_1.Op.like]: `%${search_person}%` } },
                    { lastname: { [sequelize_1.Op.like]: `%${search_person}%` } },
                    { headline: { [sequelize_1.Op.like]: `%${search_person}%` } },
                    { '$skills.skill$': { [sequelize_1.Op.like]: `%${search_person}%` } },
                    { '$experiences.exp_position$': { [sequelize_1.Op.like]: `%${search_person}%` } },
                    { '$experiences.exp_orgname$': { [sequelize_1.Op.like]: `%${search_person}%` } },
                    { '$experiences.exp_description$': { [sequelize_1.Op.like]: `%${search_person}%` } },
                    { '$educations.edu_program$': { [sequelize_1.Op.like]: `%${search_person}%` } },
                    { '$educations.edu_institution$': { [sequelize_1.Op.like]: `%${search_person}%` } },
                ],
            },
            include: [
                {
                    model: UserExperience_1.default,
                    as: "experiences",
                },
                {
                    model: UserEducation_1.default,
                    as: "educations",
                    where: {
                        ...(gpa.length > 0 ? { edu_gpa: { [sequelize_1.Op.gte]: gpa } } : {}),
                        ...(edu_type.length > 0 ? { edu_type: { [sequelize_1.Op.in]: edu_type } } : {}),
                        ...(institute.length > 0 ? { edu_institution: { [sequelize_1.Op.in]: institute } } : {}),
                    }
                },
                {
                    model: UserAttachment_1.default,
                    as: "attachments"
                },
                {
                    model: UserSocial_1.default,
                    as: "socials"
                },
                {
                    model: Skills_1.default,
                    as: "skills",
                },
                {
                    model: UserConfig_1.default,
                    as: "config"
                }
            ],
            order: [
                [sequelize_1.Sequelize.literal('CASE WHEN `experiences`.`exp_enddate` IS NULL THEN 1 ELSE 0 END'), 'DESC'],
                ['experiences', 'exp_enddate', 'DESC'],
                [sequelize_1.Sequelize.literal('CASE WHEN `educations`.`edu_enddate` IS NULL THEN 1 ELSE 0 END'), 'DESC'],
                ['educations', 'edu_enddate', 'DESC']
            ]
        });
        const USERS_COUNT = await User_1.default.count({ where: { active_search: 1 } });
        const USERS_FILTER = USERS.slice(db_offset, db_offset + db_limit);
        const updatedUsers = await Promise.all(USERS_FILTER.map(async (user) => {
            const userExperience = user.toJSON().experiences;
            const YoE = calculateTotalExperienceMonth(userExperience);
            return {
                ...user.toJSON(),
                YoE: YoE
            };
        }));
        const encryptedData = (0, crypto_1.encrypt)({
            total_entries: USERS_COUNT,
            datas: updatedUsers,
            limit: db_limit,
            page: db_page
        });
        return res.status(200).json(encryptedData);
    }
    catch (error) {
        console.error(error);
        return res.status(200).json({ message: error.message });
    }
}
exports.GetAllUserWhereActiveSearch = GetAllUserWhereActiveSearch;
async function GetUserById(req, res) {
    const userId = req.params.id;
    try {
        const USER = await User_1.default.findByPk(userId, {
            include: [
                { model: UserExperience_1.default, as: "experiences" },
                { model: UserEducation_1.default, as: "educations" },
                { model: UserAttachment_1.default, as: "attachments" },
                { model: UserSocial_1.default, as: "socials" },
                { model: Skills_1.default, as: "skills" },
                { model: UserConfig_1.default, as: "config" }
            ],
            order: [
                [sequelize_1.Sequelize.literal('CASE WHEN `experiences`.`exp_enddate` IS NULL THEN 1 ELSE 0 END'), 'DESC'],
                ['experiences', 'exp_enddate', 'DESC'],
                [sequelize_1.Sequelize.literal('CASE WHEN `educations`.`edu_enddate` IS NULL THEN 1 ELSE 0 END'), 'DESC'],
                ['educations', 'edu_enddate', 'DESC']
            ]
        });
        await USER.increment('profile_viewers', { by: 1 });
        let updatedUser = Object.assign(USER.toJSON(), { YoE: calculateTotalExperienceMonth(await USER.getExperiences()) });
        const encryptedData = (0, crypto_1.encrypt)(updatedUser);
        return res.status(200).json(encryptedData);
    }
    catch (error) {
        console.error(error);
        return res.status(200).json({ message: error.message });
    }
}
exports.GetUserById = GetUserById;
async function AddViewsUser(req, res) {
    const userId = req.params.id;
    const userAuth = req.headers.authorization;
    try {
        jsonwebtoken_1.default.verify(userAuth, process.env.ACCESS_TOKEN_SECRET, async function (err, user) {
            // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
            if (err)
                return res.status(400).json(err.message);
            const USER = await User_1.default.findByPk(userId);
            if (!USER)
                return res.status(404).json({ message: "user not found" });
            if (USER.id !== user.id) {
                USER.increment('profile_viewers', { by: 1 });
            }
            return res.sendStatus(200);
        });
    }
    catch (error) {
        console.error(error);
        return res.status(200).json({ message: error.message });
    }
}
exports.AddViewsUser = AddViewsUser;
async function GetUserByToken(req, res) {
    const userToken = req.headers.authorization;
    try {
        jsonwebtoken_1.default.verify(userToken, process.env.ACCESS_TOKEN_SECRET, async function (err, user) {
            // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
            if (err)
                return res.status(400).json(err.message);
            const USER = await User_1.default.findOne({
                where: { id: user.id },
                include: [
                    { model: UserExperience_1.default, as: "experiences" },
                    { model: UserEducation_1.default, as: "educations" },
                    { model: UserAttachment_1.default, as: "attachments" },
                    { model: UserSocial_1.default, as: "socials" },
                    { model: Skills_1.default, as: "skills" },
                    { model: UserConfig_1.default, as: "config" }
                ],
                order: [
                    [sequelize_1.Sequelize.literal('CASE WHEN `experiences`.`exp_enddate` IS NULL THEN 1 ELSE 0 END'), 'DESC'],
                    ['experiences', 'exp_enddate', 'DESC'],
                    [sequelize_1.Sequelize.literal('CASE WHEN `educations`.`edu_enddate` IS NULL THEN 1 ELSE 0 END'), 'DESC'],
                    ['educations', 'edu_enddate', 'DESC']
                ]
            });
            if (!USER)
                return res.status(404).json({ message: "user not found" });
            const YOE = calculateTotalExperienceMonth(await USER.getExperiences());
            const encryptedData = (0, crypto_1.encrypt)({ ...USER.toJSON(), YoE: YOE }, process.env.AES_KEYS);
            return res.status(200).json(encryptedData);
        });
    }
    catch (error) {
        console.error(error);
        return res.status(200).json({ message: error.message });
    }
}
exports.GetUserByToken = GetUserByToken;
async function GetTotalUser(req, res) {
    try {
        const TOTAL_USER = await User_1.default.count();
        return res.status(200).json(TOTAL_USER);
    }
    catch (error) {
        console.error(error);
        return res.status(200).json({ message: error.message });
    }
}
exports.GetTotalUser = GetTotalUser;
async function UpdateUserByToken(req, res) {
    const userToken = req.headers.authorization;
    const userData = req.body;
    delete userData.email;
    try {
        if (!userToken)
            return res.status(400).json({ message: "token is required" });
        jsonwebtoken_1.default.verify(userToken, process.env.ACCESS_TOKEN_SECRET, async function (err, decoded) {
            // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
            if (err)
                return res.status(400).send(err);
            const USER = await User_1.default.findOne({ where: { id: decoded.id }, include: [
                    { model: UserExperience_1.default, as: "experiences" },
                    { model: UserEducation_1.default, as: "educations" },
                    { model: UserAttachment_1.default, as: "attachments" },
                    { model: UserSocial_1.default, as: "socials" },
                    { model: Skills_1.default, as: "skills" },
                    { model: UserConfig_1.default, as: "config" }
                ] });
            if (!USER)
                return res.status(404).json({ message: "user not found" });
            USER.update(userData);
            if (!userData.active_search) {
                USER.update({ active_search: false });
            }
            return res.status(200).json(USER);
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}
exports.UpdateUserByToken = UpdateUserByToken;
async function GoogleLoginHandler(req, res) {
    let data = req.body;
    let userData = (0, jwt_decode_1.jwtDecode)(data);
    const USER = await User_1.default.findOne({ where: { email: userData.email } });
    if (USER) {
        const accessToken = (0, JWT_1.createToken)(USER);
        return res.status(200).json(accessToken);
    }
    if (!USER) {
        const NEW_USER = await User_1.default.create({
            email: userData.email,
            firstname: userData.given_name,
            lastname: userData.family_name
        });
        Mailer_1.default.sendMail({
            from: `"Tim Kece Internshit" <${process.env.MAILER_EMAIL}>`,
            to: userData.email,
            subject: `Selamat Datang di Internshit!`,
            html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Welcome Member Baru</title><style>.header{font-size:20px;font-weight:800;margin:2rem 0;color:#47A992}.body{padding:2rem;background-color:#e0e0e0}.email-container{padding:2rem;width:45%;margin:0 auto;background-color:#fff;border-radius:16px}@media only screen and (max-width:800px){.email-container{width:100%;border-radius:0;padding:1rem}.body{padding:0}}</style><link rel="stylesheet" href="https://unicons.iconscout.com/release/v4.0.8/css/line.css"><script src="https://cdn.tailwindcss.com"></script></head><body class="body"><div class="email-container"><img src="cid:logo" alt="Logo Website" width="60px"><h3 class="header">Haiii! Selamat datang di Internshit!</h3><p>Wah,kamu baru aja join ya? Keren banget nih!</p><p style="margin-top: 1.5rem;">Kalo ada pertanyaan atau butuh bantuan,jangan sungkan buat hubungi kita ya! Bisa kirim email ke <a href="mailto:internshit.id@gmail.com" style="color: #47A992;">internshit.id@gmail.com</a> atau DM di X kita.</p><p style="font-weight: 700; margin-top: 1.5rem;">Jangan lupa follow X kita buat update seru lainnya! </p><a href="https://x.com/internshit_id"><button style="padding: .75rem 1.5rem; border-radius: 8px; background-color: #47A992; color: white; margin: 1rem 0; font-weight: 700; font-size: .8rem; cursor: pointer; display: flex; align-items: center; gap: .5rem;">Cek X Kita! <i class="uil uil-arrow-right"></i></button></a><p><span style="font-weight: 500; color: #343434;">Salam hangat,</span><br><span style="font-weight: 700; color: #343434;">Tim Kece Internshit</span></p></div></body></html>`,
            attachments: [{
                    filename: "Logo.png",
                    path: './public/img/Logo.png',
                    cid: 'logo',
                    contentDisposition: "inline"
                }]
        });
        NEW_USER.createConfig();
        NEW_USER.createAttachments();
        NEW_USER.createSocials();
        const accessToken = (0, JWT_1.createToken)(NEW_USER);
        return res.status(200).json(accessToken);
    }
}
exports.GoogleLoginHandler = GoogleLoginHandler;
async function GetEducationsByUserToken(req, res) {
    const userToken = req.headers.authorization;
    try {
        jsonwebtoken_1.default.verify(userToken, process.env.ACCESS_TOKEN_SECRET, async function (err, user) {
            // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
            if (err)
                return res.status(200).send(false);
            const USER = await User_1.default.findOne({ where: { id: user.id } });
            const EDUCATIONS = await USER.getEducations();
            const encryptedData = (0, crypto_1.encrypt)(EDUCATIONS);
            return res.status(200).json(encryptedData);
        });
    }
    catch (error) {
        console.error(error);
        return res.status(200).json({ message: error.message });
    }
}
exports.GetEducationsByUserToken = GetEducationsByUserToken;
// ------------- EXPERIENCES ---------------
async function GetExperiencesByUserToken(req, res) {
    const userToken = req.headers.authorization;
    try {
        jsonwebtoken_1.default.verify(userToken, process.env.ACCESS_TOKEN_SECRET, async function (err, user) {
            // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
            if (err)
                return res.status(200).send(false);
            const USER = await User_1.default.findOne({ where: { id: user.id } });
            const EXPERIENCES = await USER.getExperiences({ order: [["updatedAt", "DESC"]] });
            const encryptedData = (0, crypto_1.encrypt)(EXPERIENCES);
            return res.status(200).json(encryptedData);
        });
    }
    catch (error) {
        console.error(error);
        return res.status(200).json({ message: error.message });
    }
}
exports.GetExperiencesByUserToken = GetExperiencesByUserToken;
async function UpdateExperienceById(req, res) {
    const userData = req.body;
    const ID = req.params.id;
    const userToken = req.headers.authorization;
    try {
        if (!userToken)
            return res.status(400).json({ message: "token is required" });
        jsonwebtoken_1.default.verify(userToken, process.env.ACCESS_TOKEN_SECRET, async function (err, decoded) {
            // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
            if (err)
                return res.status(400).send(err);
            const USER = await User_1.default.findOne({ where: { id: decoded.id } });
            if (!USER)
                return res.status(404).json({ message: "user not found" });
            const EXPERIENCE = await UserExperience_1.default.findByPk(ID);
            if (!userData.exp_enddate)
                userData.exp_enddate = null;
            await EXPERIENCE.update(userData);
            const EXPERIENCES = await USER.getExperiences({ order: [["createdAt", "DESC"]] });
            return res.status(200).json(EXPERIENCES);
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}
exports.UpdateExperienceById = UpdateExperienceById;
async function GetExperienceById(req, res) {
    const ID = req.params.id;
    try {
        const EXPERIENCE = await UserExperience_1.default.findByPk(ID);
        if (!EXPERIENCE)
            return res.status(400).json({ message: "Experience not found" });
        const encryptedData = (0, crypto_1.encrypt)(EXPERIENCE);
        return res.status(200).json(encryptedData);
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: error.message });
    }
}
exports.GetExperienceById = GetExperienceById;
async function AddNewExperience(req, res) {
    let experienceData = req.body;
    const userToken = req.headers.authorization;
    jsonwebtoken_1.default.verify(userToken, process.env.ACCESS_TOKEN_SECRET, async function (err, decoded) {
        // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
        if (err)
            return res.status(400).send(err);
        const USER = await User_1.default.findOne({ where: { id: decoded.id }, include: [
                { model: UserExperience_1.default, as: "experiences" },
                { model: UserEducation_1.default, as: "educations" },
            ] });
        if (!USER)
            return res.status(404).json({ message: "user not found" });
        let EXPERIENCE = await UserExperience_1.default.create(experienceData);
        await USER.addExperience(EXPERIENCE);
        let EXPERIENCES = await USER.getExperiences({
            order: [
                [sequelize_1.Sequelize.literal('CASE WHEN `exp_enddate` IS NULL THEN 1 ELSE 0 END'), 'DESC'],
                ['exp_enddate', 'DESC']
            ]
        });
        return res.status(200).json(EXPERIENCES);
    });
}
exports.AddNewExperience = AddNewExperience;
async function DeleteExperienceById(req, res) {
    const ID = req.params.id;
    try {
        const EXPERIENCE = await UserExperience_1.default.findByPk(ID);
        if (!EXPERIENCE)
            return res.status(400).json({ message: "Experience not found" });
        await UserExperience_1.default.destroy({ where: { id: ID } });
        return res.status(200).json({ message: "success deleted experience" });
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: error.message });
    }
}
exports.DeleteExperienceById = DeleteExperienceById;
// --------------- EDUCATIONS -------------------
async function AddNewEducation(req, res) {
    let educationData = req.body;
    const userToken = req.headers.authorization;
    jsonwebtoken_1.default.verify(userToken, process.env.ACCESS_TOKEN_SECRET, async function (err, decoded) {
        // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
        if (err)
            return res.status(400).send(err);
        const USER = await User_1.default.findOne({ where: { id: decoded.id }, include: [
                { model: UserExperience_1.default, as: "experiences" },
                { model: UserEducation_1.default, as: "educations" },
            ] });
        if (!USER)
            return res.status(404).json({ message: "user not found" });
        let EDUCATION = await UserEducation_1.default.create(educationData);
        await USER.addEducation(EDUCATION);
        let EDUCATIONS = await USER.getEducations({
            order: [
                [sequelize_1.Sequelize.literal('CASE WHEN `edu_enddate` IS NULL THEN 1 ELSE 0 END'), 'DESC'],
                ['edu_enddate', 'DESC']
            ]
        });
        return res.status(200).json(EDUCATIONS);
    });
}
exports.AddNewEducation = AddNewEducation;
async function GetAllUserEducations(req, res) {
    try {
        const LOCATIONS = await UserEducation_1.default.findAll({ attributes: ["edu_institution"] });
        const encryptedData = (0, crypto_1.encrypt)(LOCATIONS);
        return res.status(200).json(encryptedData);
    }
    catch (error) {
        console.error(error);
        return res.status(200).json({ message: error.message });
    }
}
exports.GetAllUserEducations = GetAllUserEducations;
async function UpdateEducationById(req, res) {
    const userData = req.body;
    const ID = req.params.id;
    const userToken = req.headers.authorization;
    try {
        if (!userToken)
            return res.status(400).json({ message: "token is required" });
        jsonwebtoken_1.default.verify(userToken, process.env.ACCESS_TOKEN_SECRET, async function (err, decoded) {
            // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
            if (err)
                return res.status(400).send(err);
            const USER = await User_1.default.findOne({ where: { id: decoded.id } });
            if (!USER)
                return res.status(404).json({ message: "user not found" });
            const EDUCATION = await UserEducation_1.default.findByPk(ID);
            await EDUCATION.update(userData);
            const EDUCATIONS = await USER.getEducations({ order: [["createdAt", "DESC"]] });
            return res.status(200).json(EDUCATIONS);
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}
exports.UpdateEducationById = UpdateEducationById;
async function DeleteEducationById(req, res) {
    const ID = req.params.id;
    try {
        const EDUCATION = await UserEducation_1.default.findByPk(ID);
        if (!EDUCATION)
            return res.status(400).json({ message: "Education not found" });
        await UserEducation_1.default.destroy({ where: { id: ID } });
        return res.status(200).json({ message: "success deleted education" });
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: error.message });
    }
}
exports.DeleteEducationById = DeleteEducationById;
// ------------------- SKILLS --------------------
async function GetAllSkills(req, res) {
    try {
        const SKILLS = await Skills_1.default.findAll();
        const encryptedData = (0, crypto_1.encrypt)(SKILLS);
        return res.status(200).json(encryptedData);
    }
    catch (error) {
        console.error(error);
        return res.status(200).json({ message: error.message });
    }
}
exports.GetAllSkills = GetAllSkills;
async function AddNewSkill(req, res) {
    const skillBody = req.body;
    try {
        const SKILLS = await Skills_1.default.create(skillBody);
        const encryptedData = (0, crypto_1.encrypt)(SKILLS);
        return res.status(200).json(encryptedData);
    }
    catch (error) {
        console.error(error);
        return res.status(200).json({ message: error.message });
    }
}
exports.AddNewSkill = AddNewSkill;
async function AddSkillToUser(req, res) {
    let skillBody = req.body.split(";");
    const userToken = req.headers.authorization;
    try {
        jsonwebtoken_1.default.verify(userToken, process.env.ACCESS_TOKEN_SECRET, async function (err, decoded) {
            // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
            if (err)
                return res.status(400).send(err);
            const USER = await User_1.default.findOne({ where: { id: decoded.id } });
            if (!USER)
                return res.status(404).json({ message: "user not found" });
            const SKILLS = await Skills_1.default.findAll({ where: { id: skillBody } });
            await USER.setSkills(SKILLS);
            const USER_SKILLS = await USER.getSkills();
            return res.status(200).json(USER_SKILLS);
        });
        // await User
        // return res.status(200).json(skillBody)
    }
    catch (error) {
        console.error(error);
        return res.status(200).json({ message: error.message });
    }
}
exports.AddSkillToUser = AddSkillToUser;
// -------------------- LOCATION -------------------------
async function GetAllLocations(req, res) {
    try {
        const LOCATIONS = await Locations_1.default.findAll();
        const encryptedData = (0, crypto_1.encrypt)(LOCATIONS);
        return res.status(200).json(encryptedData);
    }
    catch (error) {
        console.error(error);
        return res.status(200).json({ message: error.message });
    }
}
exports.GetAllLocations = GetAllLocations;
async function GetAllUserDomicile(req, res) {
    try {
        const LOCATIONS = await User_1.default.findAll({ attributes: ["domicile"] });
        const encryptedData = (0, crypto_1.encrypt)(LOCATIONS);
        return res.status(200).json(encryptedData);
    }
    catch (error) {
        console.error(error);
        return res.status(200).json({ message: error.message });
    }
}
exports.GetAllUserDomicile = GetAllUserDomicile;
async function AddNewLocation(req, res) {
    const locationBody = req.body;
    try {
        const LOCATIONS = await Locations_1.default.create(locationBody);
        const encryptedData = (0, crypto_1.encrypt)(LOCATIONS);
        return res.status(200).json(encryptedData);
    }
    catch (error) {
        console.error(error);
        return res.status(200).json({ message: error.message });
    }
}
exports.AddNewLocation = AddNewLocation;
// --------------------- ATTACHMENT -------------------
async function UpdateAttachment(req, res) {
    let attachmentData = req.body;
    const userToken = req.headers.authorization;
    jsonwebtoken_1.default.verify(userToken, process.env.ACCESS_TOKEN_SECRET, async function (err, decoded) {
        // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
        if (err)
            return res.status(400).send(err);
        const USER = await User_1.default.findOne({ where: { id: decoded.id }, include: [
                { model: UserExperience_1.default, as: "experiences" },
                { model: UserEducation_1.default, as: "educations" },
                { model: UserAttachment_1.default, as: "attachments" },
                { model: UserSocial_1.default, as: "socials" },
                { model: Skills_1.default, as: "skills" },
                { model: UserConfig_1.default, as: "config" }
            ] });
        if (!USER)
            return res.status(404).json({ message: "user not found" });
        const hasAttachments = await USER.getAttachments();
        if (!hasAttachments) {
            await USER.createAttachments(attachmentData);
        }
        else {
            await UserAttachment_1.default.destroy({ where: { id: (await USER.getAttachments()).id } });
            const ATTACHMENT = await UserAttachment_1.default.create(attachmentData);
            await USER.setAttachments(ATTACHMENT);
        }
        const newAttachments = await USER.getAttachments();
        return res.status(200).json(newAttachments);
    });
}
exports.UpdateAttachment = UpdateAttachment;
async function UpdateSocials(req, res) {
    let socialsData = req.body;
    const userToken = req.headers.authorization;
    jsonwebtoken_1.default.verify(userToken, process.env.ACCESS_TOKEN_SECRET, async function (err, decoded) {
        // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
        if (err)
            return res.status(400).send(err);
        const USER = await User_1.default.findOne({ where: { id: decoded.id }, include: [
                { model: UserExperience_1.default, as: "experiences" },
                { model: UserEducation_1.default, as: "educations" },
                { model: UserAttachment_1.default, as: "attachments" },
                { model: UserSocial_1.default, as: "socials" },
                { model: Skills_1.default, as: "skills" },
                { model: UserConfig_1.default, as: "config" }
            ] });
        if (!USER)
            return res.status(404).json({ message: "user not found" });
        const hasSocials = await USER.getSocials();
        if (!hasSocials) {
            await USER.createSocials(socialsData);
        }
        else {
            await UserSocial_1.default.destroy({ where: { id: (await USER.getSocials()).id } });
            const SOCIALS = await UserSocial_1.default.create(socialsData);
            await USER.setSocials(SOCIALS);
        }
        const newSocials = await USER.getSocials();
        return res.status(200).json(newSocials);
    });
}
exports.UpdateSocials = UpdateSocials;
// -------------------- PROFILE PICTURE ---------------------
async function GetAllProfilePicture(req, res) {
    const files = fs_1.default.readdirSync(path_1.default.join(__dirname, "..", "..", "public", "app", "assets", "img", "ProfilePic"));
    const urlFiles = files.map(file => {
        return `/assets/img/ProfilePic/${file}`;
    });
    return res.status(200).json(urlFiles);
}
exports.GetAllProfilePicture = GetAllProfilePicture;
async function UpdateActiveSearch(req, res) {
    let configData = req.body;
    const userToken = req.headers.authorization;
    jsonwebtoken_1.default.verify(userToken, process.env.ACCESS_TOKEN_SECRET, async function (err, decoded) {
        // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
        if (err)
            return res.status(400).send(err);
        const USER = await User_1.default.findOne({ where: { id: decoded.id } });
        if (!USER)
            return res.status(404).json({ message: "user not found" });
        const USER_CONFIG = await USER.getConfig();
        if (!USER_CONFIG)
            return res.status(400).json({ message: "user config not found" });
        await USER_CONFIG.update(configData);
        return res.status(200).json(await USER.getConfig());
    });
}
exports.UpdateActiveSearch = UpdateActiveSearch;
async function CreateSocialUserDontHave(req, res) {
    try {
        const USERS = await User_1.default.findAll({
            include: [
                {
                    model: UserSocial_1.default,
                    as: "socials",
                    required: false // Left join to allow users without socials
                }
            ],
            where: {
                '$socials.id$': null // Filter users without socials
            }
        });
        USERS.forEach(async (user) => {
            await user.createSocials();
        });
        return res.status(200).json({ message: "succes create socials to all user who dont have" });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
exports.CreateSocialUserDontHave = CreateSocialUserDontHave;
async function CreateAttachmentUserDontHave(req, res) {
    try {
        const USERS = await User_1.default.findAll({
            include: [
                {
                    model: UserAttachment_1.default,
                    as: "attachments",
                    required: false // Left join to allow users without socials
                }
            ],
            where: {
                '$attachments.id$': null // Filter users without socials
            }
        });
        console.log(USERS.length);
        USERS.forEach(async (user) => {
            await user.createAttachments();
        });
        return res.status(200).json({ message: "succes create attachment to all user who dont have" });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
exports.CreateAttachmentUserDontHave = CreateAttachmentUserDontHave;
async function ChangeImageRouter(req, res) {
    try {
        // Langkah 1: Ambil semua user dengan profile_picture yang berawalan /img/ atau sudah terlanjur /assets/img/
        const USERS = await User_1.default.findAll({
            attributes: ["id", "profile_picture"],
            where: {
                profile_picture: {
                    [sequelize_1.Op.or]: [
                        { [sequelize_1.Op.like]: '%/img/%' }, // Path yang belum berubah
                    ]
                }
            }
        });
        // Langkah 2: Ubah setiap profile_picture yang sesuai
        const updatedUsers = await Promise.all(USERS.map(async (user) => {
            let updatedProfilePicture = user.profile_picture;
            // Hilangkan redundansi assets/assets/ jika ada
            updatedProfilePicture = updatedProfilePicture.replace(/\/assets\/(assets\/)+/g, '/assets/');
            // Ubah /img/ menjadi /assets/img/ jika masih ada
            if (updatedProfilePicture.includes('/img/') && !updatedProfilePicture.includes('/assets/img/')) {
                updatedProfilePicture = updatedProfilePicture.replace('/img/', '/assets/img/');
            }
            // Ubah .png menjadi .webp
            if (updatedProfilePicture.endsWith('.png')) {
                updatedProfilePicture = updatedProfilePicture.replace('.png', '.webp');
            }
            // Langkah 3: Simpan perubahan ke database jika ada perubahan
            if (updatedProfilePicture !== user.profile_picture) {
                await user.update({ profile_picture: updatedProfilePicture });
            }
            return {
                id: user.id,
                old_picture: user.profile_picture,
                new_picture: updatedProfilePicture
            };
        }));
        // Langkah 4: Kirim hasil yang telah diubah sebagai response
        return res.status(200).json({ updatedUsers });
    }
    catch (error) {
        // Handle error
        return res.status(500).json({ message: error.message });
    }
}
exports.ChangeImageRouter = ChangeImageRouter;
function calculateTotalExperienceMonth(experiences) {
    let totalMonths = 0;
    experiences.forEach(exp => {
        const startDate = new Date(exp.exp_startdate);
        const endDate = exp.exp_enddate ? new Date(exp.exp_enddate) : new Date();
        const yearsDifference = endDate.getFullYear() - startDate.getFullYear();
        const monthsDifference = endDate.getMonth() - startDate.getMonth();
        totalMonths += (yearsDifference * 12) + monthsDifference;
    });
    return totalMonths;
}
//# sourceMappingURL=user.controller.js.map