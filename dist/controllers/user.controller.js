"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateActiveSearch = exports.GetAllProfilePicture = exports.UpdateSocials = exports.UpdateAttachment = exports.AddNewLocation = exports.GetAllUserDomicile = exports.GetAllLocations = exports.AddSkillToUser = exports.AddNewSkill = exports.GetAllSkills = exports.DeleteEducationById = exports.UpdateEducationById = exports.GetAllUserEducations = exports.AddNewEducation = exports.DeleteExperienceById = exports.AddNewExperience = exports.GetExperienceById = exports.UpdateExperienceById = exports.GetExperiencesByUserToken = exports.GetEducationsByUserToken = exports.GoogleLoginHandler = exports.UpdateUserByToken = exports.GetTotalUser = exports.GetUserByToken = exports.AddViewsUser = exports.GetUserById = exports.GetAllUserWhereActiveSearch = exports.UserLogout = exports.VerifyJWT = void 0;
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
function UserLogout(req, res) {
    try {
        res.clearCookie("userAuthenticate");
        res.redirect("/");
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: error.message });
    }
}
exports.UserLogout = UserLogout;
async function GetAllUserWhereActiveSearch(req, res) {
    let keyword = req.query.keyword ? req.query.keyword : "";
    let university = req.query.university || "[]";
    let edu_type = req.query.edu_type;
    let work_pref = req.query.work_pref;
    let gpa = req.query.gpa;
    let gender = req.query.gender;
    console.log(gpa);
    let universitys = JSON.parse(university);
    if (!Array.isArray(universitys)) {
        universitys = [];
    }
    try {
        const USERS = await User_1.default.findAll({
            where: {
                active_search: true,
                ...(gender ? { sex: gender } : {}),
                ...(work_pref ? { work_pref_status: work_pref } : {}),
                [sequelize_1.Op.or]: [
                    { firstname: { [sequelize_1.Op.like]: `%${keyword}%` } },
                    { lastname: { [sequelize_1.Op.like]: `%${keyword}%` } },
                    { headline: { [sequelize_1.Op.like]: `%${keyword}%` } },
                    { '$experiences.exp_position$': { [sequelize_1.Op.like]: `%${keyword}%` } },
                    { '$experiences.exp_orgname$': { [sequelize_1.Op.like]: `%${keyword}%` } },
                    { '$educations.edu_program$': { [sequelize_1.Op.like]: `%${keyword}%` } },
                ]
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
                        ...(edu_type ? { edu_type } : {}),
                        ...(gpa ? { edu_gpa: { [sequelize_1.Op.gte]: gpa } } : {}),
                        ...(universitys.length > 0 ? { edu_institution: { [sequelize_1.Op.in]: universitys } } : {})
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
                    as: "skills"
                },
                {
                    model: UserConfig_1.default,
                    as: "config"
                }
            ],
        });
        const updatedUsers = await Promise.all(USERS.map(async (user) => {
            const userExperience = user.toJSON().experiences;
            const YoE = calculateTotalExperienceMonth(userExperience);
            return {
                ...user.toJSON(),
                YoE: YoE
            };
        }));
        const encryptedData = (0, crypto_1.encrypt)(updatedUsers);
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
            ]
        });
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
            else {
                console.log("lihat diri sendiri");
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
            const USER = await User_1.default.findOne({ where: { id: user.id }, include: [
                    { model: UserExperience_1.default, as: "experiences" },
                    { model: UserEducation_1.default, as: "educations" },
                    { model: UserAttachment_1.default, as: "attachments" },
                    { model: UserSocial_1.default, as: "socials" },
                    { model: Skills_1.default, as: "skills" },
                    { model: UserConfig_1.default, as: "config" }
                ] });
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
    console.log(userData);
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
    let userData = (0, jwt_decode_1.jwtDecode)(data.token);
    const USER = await User_1.default.findOne({ where: { email: userData.email } });
    if (USER) {
        const accessToken = (0, JWT_1.createToken)(USER);
        res.cookie("userAuthenticate", accessToken, {
            maxAge: 360000000,
        });
        return res.status(200).json(accessToken);
    }
    if (!USER) {
        const NEW_USER = await User_1.default.create({
            email: userData.email,
            firstname: userData.given_name,
            lastname: userData.family_name
        });
        NEW_USER.createConfig();
        const accessToken = (0, JWT_1.createToken)(NEW_USER);
        res.cookie("userAuthenticate", accessToken, {
            maxAge: 360000000,
        });
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
        let EXPERIENCES = await USER.getExperiences({ order: [["createdAt", "DESC"]] });
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
        return res.sendStatus(200);
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
        let EDUCATIONS = await USER.getEducations({ order: [["createdAt", "DESC"]] });
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
        return res.sendStatus(200);
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
    let skillBody = req.body.skills.split(",");
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
        console.log(newAttachments);
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
        console.log(newSocials);
        return res.status(200).json(newSocials);
    });
}
exports.UpdateSocials = UpdateSocials;
// -------------------- PROFILE PICTURE ---------------------
async function GetAllProfilePicture(req, res) {
    const files = fs_1.default.readdirSync(path_1.default.join(__dirname, "..", "..", "public", "img", "ProfilePic"));
    const urlFiles = files.map(file => {
        return `/img/ProfilePic/${file}`;
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