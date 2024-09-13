import jwt from "jsonwebtoken"
import User from "../models/User"
import { Request, Response } from "express"
import { createToken } from "../config/JWT"
import { encrypt } from "../config/crypto"
import { jwtDecode } from "jwt-decode";
import Experience from "../models/UserExperience"
import Education from "../models/UserEducation"
import Attachment from "../models/UserAttachment"
import Socials from "../models/UserSocial"
import Skills from "../models/Skills"
import fs from "fs"
import path from "path"
import Config from "../models/UserConfig"
import Locations from "../models/Locations"
import { Op, Sequelize } from "sequelize";
import transporter from "../config/Mailer"

export function VerifyJWT(req:Request, res:Response){
    const accessToken = req.headers.authorization
    try {
        if(!accessToken) return res.status(200).send(false)
        jwt.verify(accessToken.toString(), process.env.ACCESS_TOKEN_SECRET, async function (err, _){
            if(err) return res.status(200).send(false)
            return res.status(200).json(true)
        })
    } catch (error) {
        console.error(error.message)
        return res.status(500).json({message: error.message})
    }
}

export function UserLogout(req:Request, res:Response){
    try {
        res.clearCookie("userAuthenticate");
        res.redirect("/");
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
}

export async function GetAllUsers(req:Request, res: Response){
    let keyword = req.query.keyword ? req.query.keyword : ""
    let university:any = req.query.university || "[]"
    let edu_type = req.query.edu_type || ""
    let work_pref = req.query.work_pref || ""
    let gpa:any = req.query.gpa || ""
    let gender:any = req.query.gender || ""

    let db_page = req.query.page || 1
    let db_limit = req.query.limit || 20
    let db_offset:any = req.query.offset

    console.log(req.query);
    


    let universitys = JSON.parse(university)
    if (!Array.isArray(universitys)) {
        universitys = [];
    }

    try {
        const USERS = await User.findAll({
            limit: +db_limit,
            offset: +db_offset || (+db_page - 1) * +db_limit,
            where: {
                active_search: true,
                ...(gender ? { sex: gender } : {}),
                ...(work_pref ? { work_pref_status: work_pref } : {}),
                [Op.or]: [
                    { firstname: { [Op.like]: `%${keyword}%` } },
                    { lastname: { [Op.like]: `%${keyword}%` } },
                    { headline: { [Op.like]: `%${keyword}%` } },
                    { '$experiences.exp_position$': {[Op.like]: `%${keyword}%`}},
                    { '$experiences.exp_orgname$': {[Op.like]: `%${keyword}%`}},
                    { '$educations.edu_program$': {[Op.like]: `%${keyword}%`}},
                ]
            },
            include: [
                {
                    model: Experience,
                    as: "experiences",
                },
                {
                    model: Education,
                    as: "educations",
                    where: {
                        ...(edu_type ? { edu_type } : {}),
                        ...(gpa ? { edu_gpa: {[Op.gte] : gpa} } : {}),
                        ...(universitys.length > 0 ? { edu_institution: { [Op.in]: universitys } } : {})
                    }
                },
                {
                    model: Attachment,
                    as: "attachments"
                },
                {
                    model: Socials,
                    as: "socials"
                },
                {
                    model: Skills,
                    as: "skills"
                },
                {
                    model: Config,
                    as: "config"
                }
            ],
            order: [
                [Sequelize.literal('CASE WHEN `experiences`.`exp_enddate` IS NULL THEN 1 ELSE 0 END'), 'DESC'],
                ['experiences', 'exp_enddate', 'DESC'],
                [Sequelize.literal('CASE WHEN `educations`.`edu_enddate` IS NULL THEN 1 ELSE 0 END'), 'DESC'],
                ['educations', 'edu_enddate', 'DESC']
            ]
        });

        const USER_COUNT = await User.count()

        const updatedUsers = await Promise.all(USERS.map(async user => {
            const userExperience = user.toJSON().experiences;
            const YoE = calculateTotalExperienceMonth(userExperience);
            return {
                ...user.toJSON(),
                YoE: YoE
            };
        }));

        
        const encryptedData = encrypt({
            total_post: USER_COUNT,
            datas: updatedUsers
        })
        return res.status(200).json(encryptedData)
    } catch (error) {
        console.error(error)
        return res.status(200).json({message: error.message})
    }
}

export async function GetAllUserWhereActiveSearch(req:Request, res: Response){
    let keyword = req.query.keyword ? req.query.keyword : ""
    let university:any = req.query.university || "[]"
    let edu_type = req.query.edu_type
    let work_pref = req.query.work_pref
    let gpa:any = req.query.gpa
    let gender:any = req.query.gender

    let universitys = JSON.parse(university)
    if (!Array.isArray(universitys)) {
        universitys = [];
    }

    try {
        const USERS = await User.findAll({
            where: {
                active_search: true,
                ...(gender ? { sex: gender } : {}),
                ...(work_pref ? { work_pref_status: work_pref } : {}),
                [Op.or]: [
                    { firstname: { [Op.like]: `%${keyword}%` } },
                    { lastname: { [Op.like]: `%${keyword}%` } },
                    { headline: { [Op.like]: `%${keyword}%` } },
                    { '$experiences.exp_position$': {[Op.like]: `%${keyword}%`}},
                    { '$experiences.exp_orgname$': {[Op.like]: `%${keyword}%`}},
                    { '$educations.edu_program$': {[Op.like]: `%${keyword}%`}},
                ]
            },
            include: [
                {
                    model: Experience,
                    as: "experiences",
                },
                {
                    model: Education,
                    as: "educations",
                    where: {
                        ...(edu_type ? { edu_type } : {}),
                        ...(gpa ? { edu_gpa: {[Op.gte] : gpa} } : {}),
                        ...(universitys.length > 0 ? { edu_institution: { [Op.in]: universitys } } : {})
                    }
                },
                {
                    model: Attachment,
                    as: "attachments"
                },
                {
                    model: Socials,
                    as: "socials"
                },
                {
                    model: Skills,
                    as: "skills"
                },
                {
                    model: Config,
                    as: "config"
                }
            ],
            order: [
                [Sequelize.literal('CASE WHEN `experiences`.`exp_enddate` IS NULL THEN 1 ELSE 0 END'), 'DESC'],
                ['experiences', 'exp_enddate', 'DESC'],
                [Sequelize.literal('CASE WHEN `educations`.`edu_enddate` IS NULL THEN 1 ELSE 0 END'), 'DESC'],
                ['educations', 'edu_enddate', 'DESC']
            ]
        });

        const POST_COUNT = await User.count({where: {active_search: 1}})

        const updatedUsers = await Promise.all(USERS.map(async user => {
            const userExperience = user.toJSON().experiences;
            const YoE = calculateTotalExperienceMonth(userExperience);
            return {
                ...user.toJSON(),
                YoE: YoE
            };
        }));

        
        const encryptedData = encrypt({
            total_entries: POST_COUNT,
            datas: updatedUsers
        })
        return res.status(200).json(encryptedData)
    } catch (error) {
        console.error(error)
        return res.status(200).json({message: error.message})
    }
}

export async function GetUserById(req:Request, res: Response){
    const userId = req.params.id
    try {
        const USER = await User.findByPk(userId, {
            include: [
                {model: Experience, as: "experiences"},
                {model: Education, as: "educations"},
                {model: Attachment, as: "attachments"},
                {model: Socials, as: "socials"},
                {model: Skills, as: "skills"},
                {model: Config, as: "config"}
            ],
            order: [
                [Sequelize.literal('CASE WHEN `experiences`.`exp_enddate` IS NULL THEN 1 ELSE 0 END'), 'DESC'],
                ['experiences', 'exp_enddate', 'DESC'],
                [Sequelize.literal('CASE WHEN `educations`.`edu_enddate` IS NULL THEN 1 ELSE 0 END'), 'DESC'],
                ['educations', 'edu_enddate', 'DESC']
            ]
        })

        let updatedUser = Object.assign(USER.toJSON(), {YoE: calculateTotalExperienceMonth(await USER.getExperiences())})

        const encryptedData = encrypt(updatedUser)
        return res.status(200).json(encryptedData)
    } catch (error) {
        console.error(error)
        return res.status(200).json({message: error.message})
    }
}

export async function AddViewsUser(req:Request, res: Response){
    const userId = req.params.id
    const userAuth = req.headers.authorization
    try {
        jwt.verify(userAuth, process.env.ACCESS_TOKEN_SECRET, async function (err, user:any){
            // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
            if(err) return res.status(400).json(err.message)
            const USER = await User.findByPk(userId)
            if(!USER) return res.status(404).json({message: "user not found"})

            if(USER.id !== user.id){
                USER.increment('profile_viewers', { by: 1 })
            }
                
            return res.sendStatus(200)
        })
    } catch (error) {
        console.error(error)
        return res.status(200).json({message: error.message})
    }
}

export async function GetUserByToken(req:Request, res: Response){
    const userToken:any = req.headers.authorization;

    try {
        jwt.verify(userToken, process.env.ACCESS_TOKEN_SECRET, async function (err, user:any){
            // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
            if(err) return res.status(400).json(err.message)
                const USER = await User.findOne({
                    where: { id: user.id },
                    include: [
                        { model: Experience, as: "experiences" },
                        { model: Education, as: "educations" },
                        { model: Attachment, as: "attachments" },
                        { model: Socials, as: "socials" },
                        { model: Skills, as: "skills" },
                        { model: Config, as: "config" }
                    ],
                    order: [
                        [Sequelize.literal('CASE WHEN `experiences`.`exp_enddate` IS NULL THEN 1 ELSE 0 END'), 'DESC'],
                        ['experiences', 'exp_enddate', 'DESC'],
                        [Sequelize.literal('CASE WHEN `educations`.`edu_enddate` IS NULL THEN 1 ELSE 0 END'), 'DESC'],
                        ['educations', 'edu_enddate', 'DESC']
                    ]
                });
            if(!USER) return res.status(404).json({message: "user not found"})

            const YOE = calculateTotalExperienceMonth(await USER.getExperiences())

            const encryptedData = encrypt({...USER.toJSON(), YoE: YOE}, process.env.AES_KEYS)
            return res.status(200).json(encryptedData)
        })
    } catch (error) {
        console.error(error)
        return res.status(200).json({message: error.message})
    }
}

export async function GetTotalUser(req:Request, res: Response){
    try {
        const TOTAL_USER = await User.count()
        return res.status(200).json(TOTAL_USER)
    } catch (error) {
        console.error(error)
        return res.status(200).json({message: error.message})
    }
}

export async function UpdateUserByToken(req:Request, res: Response){
    const userToken = req.headers.authorization;
    const userData = req.body

    delete userData.email
    
    try {
        if(!userToken) return res.status(400).json({message: "token is required"})

        jwt.verify(userToken, process.env.ACCESS_TOKEN_SECRET, async function (err, decoded:any){
            // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
            if(err) return res.status(400).send(err)
            const USER = await User.findOne({where:{id: decoded.id}, include:[
                {model: Experience, as: "experiences"},
                {model: Education, as: "educations"},
                {model: Attachment, as: "attachments"},
                {model: Socials, as: "socials"},
                {model: Skills, as: "skills"},
                {model: Config, as: "config"}
            ]})
            if(!USER) return res.status(404).json({message: "user not found"})
            USER.update(userData)

            if(!userData.active_search){
                USER.update({active_search: false})
            }

            return res.status(200).json(USER)
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: error.message})
    }
}

export async function GoogleLoginHandler(req:Request, res: Response){
    let data = req.body  
    let userData:any = jwtDecode(data);    

    const USER = await User.findOne({where: { email: userData.email }})

    if(USER){
        const accessToken = createToken(USER)
        return res.status(200).json(accessToken)
    }
    if(!USER){
        const NEW_USER = await User.create({
            email: userData.email,
            firstname: userData.given_name,
            lastname: userData.family_name
        })
        // transporter.sendMail({
        //     from: `"Tim Kece Internshit" <${process.env.MAILER_EMAIL}>`, // sender address
        //     to: userData.email,
        //     subject: `Selamat Datang di Internshit!`,
        //     html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Welcome Member Baru</title><style>.header{font-size:20px;font-weight:800;margin:2rem 0;color:#47A992}.body{padding:2rem;background-color:#e0e0e0}.email-container{padding:2rem;width:45%;margin:0 auto;background-color:#fff;border-radius:16px}@media only screen and (max-width:800px){.email-container{width:100%;border-radius:0;padding:1rem}.body{padding:0}}</style><link rel="stylesheet" href="https://unicons.iconscout.com/release/v4.0.8/css/line.css"><script src="https://cdn.tailwindcss.com"></script></head><body class="body"><div class="email-container"><img src="cid:logo" alt="Logo Website" width="60px"><h3 class="header">Haiii! Selamat datang di Internshit!</h3><p>Wah,kamu baru aja join ya? Keren banget nih!</p><p style="margin-top: 1.5rem;">Kalo ada pertanyaan atau butuh bantuan,jangan sungkan buat hubungi kita ya! Bisa kirim email ke <a href="mailto:internshit.id@gmail.com" style="color: #47A992;">internshit.id@gmail.com</a> atau DM di X kita.</p><p style="font-weight: 700; margin-top: 1.5rem;">Jangan lupa follow X kita buat update seru lainnya! </p><a href="https://x.com/internshit_id"><button style="padding: .75rem 1.5rem; border-radius: 8px; background-color: #47A992; color: white; margin: 1rem 0; font-weight: 700; font-size: .8rem; cursor: pointer; display: flex; align-items: center; gap: .5rem;">Cek X Kita! <i class="uil uil-arrow-right"></i></button></a><p><span style="font-weight: 500; color: #343434;">Salam hangat,</span><br><span style="font-weight: 700; color: #343434;">Tim Kece Internshit</span></p></div></body></html>`,
        //     attachments:[{
        //       filename:"Logo.png",
        //       path: './public/img/Logo.png',
        //       cid: 'logo',
        //       contentDisposition:"inline"
        //     }]
        // });
        NEW_USER.createConfig()
        NEW_USER.createSocials()
        const accessToken = createToken(NEW_USER)
        return res.status(200).json(accessToken)
    }
}

export async function GetEducationsByUserToken(req:Request, res: Response){
    const userToken:any = req.headers.authorization;
    try {
        jwt.verify(userToken, process.env.ACCESS_TOKEN_SECRET, async function (err, user:any){
            // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
            if(err) return res.status(200).send(false)
            const USER = await User.findOne({where:{id: user.id}})
        
            const EDUCATIONS = await USER.getEducations()
            const encryptedData = encrypt(EDUCATIONS)
            return res.status(200).json(encryptedData)
        })
    } catch (error) {
        console.error(error)
        return res.status(200).json({message: error.message})
    }
}


// ------------- EXPERIENCES ---------------

export async function GetExperiencesByUserToken(req:Request, res: Response){
    const userToken:any = req.headers.authorization;
    try {
        jwt.verify(userToken, process.env.ACCESS_TOKEN_SECRET, async function (err, user:any){
            // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
            if(err) return res.status(200).send(false)
            const USER = await User.findOne({where:{id: user.id}})

            const EXPERIENCES = await USER.getExperiences({order:[["updatedAt", "DESC"]]})
            const encryptedData = encrypt(EXPERIENCES)
            return res.status(200).json(encryptedData)
        })
    } catch (error) {
        console.error(error)
        return res.status(200).json({message: error.message})
    }
}

export async function UpdateExperienceById(req:Request, res: Response){
    const userData = req.body
    const ID = req.params.id
    const userToken = req.headers.authorization

    try {
        if(!userToken) return res.status(400).json({message: "token is required"})

        jwt.verify(userToken, process.env.ACCESS_TOKEN_SECRET, async function (err, decoded:any){
            // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
            if(err) return res.status(400).send(err)
            const USER = await User.findOne({where:{id: decoded.id}})
            if(!USER) return res.status(404).json({message: "user not found"})
            const EXPERIENCE = await Experience.findByPk(ID)

            if(!userData.exp_enddate) userData.exp_enddate = null

            await EXPERIENCE.update(userData)
            const EXPERIENCES = await USER.getExperiences({order: [["createdAt", "DESC"]]})

            return res.status(200).json(EXPERIENCES)
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: error.message})
    }
}

export async function GetExperienceById(req:Request, res:Response) {
    const ID = req.params.id
    try {
        const EXPERIENCE = await Experience.findByPk(ID)
        if(!EXPERIENCE) return res.status(400).json({message: "Experience not found"})
        const encryptedData = encrypt(EXPERIENCE)
        return res.status(200).json(encryptedData)
    } catch (error) {
        console.error(error.message)
        return res.status(500).json({message: error.message})
    }
}

export async function AddNewExperience(req:Request, res: Response){
    let experienceData = req.body
    const userToken = req.headers.authorization;

    jwt.verify(userToken, process.env.ACCESS_TOKEN_SECRET, async function (err, decoded:any){
        // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
        if(err) return res.status(400).send(err)
        const USER = await User.findOne({where:{id: decoded.id}, include: [
            {model: Experience, as: "experiences"},
            {model: Education, as: "educations"},
        ]})
        if(!USER) return res.status(404).json({message: "user not found"})

        let EXPERIENCE = await Experience.create(experienceData)
        await USER.addExperience(EXPERIENCE)
        let EXPERIENCES = await USER.getExperiences({
            order: [
                [Sequelize.literal('CASE WHEN `exp_enddate` IS NULL THEN 1 ELSE 0 END'), 'DESC'],
                ['exp_enddate', 'DESC']
            ]
        })

        return res.status(200).json(EXPERIENCES)
    })
}

export async function DeleteExperienceById(req:Request, res:Response) {
    const ID = req.params.id
    try {
        const EXPERIENCE = await Experience.findByPk(ID)
        if(!EXPERIENCE) return res.status(400).json({message: "Experience not found"})
        await Experience.destroy({ where: { id: ID }})
        return res.sendStatus(200)
    } catch (error) {
        console.error(error.message)
        return res.status(500).json({message: error.message})
    }
}

// --------------- EDUCATIONS -------------------

export async function AddNewEducation(req:Request, res: Response){
    let educationData = req.body
    const userToken = req.headers.authorization;

    jwt.verify(userToken, process.env.ACCESS_TOKEN_SECRET, async function (err, decoded:any){
        // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
        if(err) return res.status(400).send(err)
        const USER = await User.findOne({where:{id: decoded.id}, include: [
            {model: Experience, as: "experiences"},
            {model: Education, as: "educations"},
        ]})
        if(!USER) return res.status(404).json({message: "user not found"})

        let EDUCATION = await Education.create(educationData)
        await USER.addEducation(EDUCATION)
        let EDUCATIONS = await USER.getEducations({
            order: [
                [Sequelize.literal('CASE WHEN `edu_enddate` IS NULL THEN 1 ELSE 0 END'), 'DESC'],
                ['edu_enddate', 'DESC']
            ]})

        return res.status(200).json(EDUCATIONS)
    })
}

export async function GetAllUserEducations(req:Request, res: Response){
    try {
        const LOCATIONS = await Education.findAll({attributes: ["edu_institution"]})
        
        const encryptedData = encrypt(LOCATIONS)
        return res.status(200).json(encryptedData)
    } catch (error) {
        console.error(error)
        return res.status(200).json({message: error.message})
    }
}

export async function UpdateEducationById(req:Request, res: Response){
    const userData = req.body
    const ID = req.params.id
    const userToken = req.headers.authorization

    try {
        if(!userToken) return res.status(400).json({message: "token is required"})

        jwt.verify(userToken, process.env.ACCESS_TOKEN_SECRET, async function (err, decoded:any){
            // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
            if(err) return res.status(400).send(err)
            const USER = await User.findOne({where:{id: decoded.id}})
            if(!USER) return res.status(404).json({message: "user not found"})
            const EDUCATION = await Education.findByPk(ID)
            await EDUCATION.update(userData)
            const EDUCATIONS = await USER.getEducations({order: [["createdAt", "DESC"]]})

            return res.status(200).json(EDUCATIONS)
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: error.message})
    }
}

export async function DeleteEducationById(req:Request, res:Response) {
    const ID = req.params.id
    try {
        const EDUCATION = await Education.findByPk(ID)
        if(!EDUCATION) return res.status(400).json({message: "Education not found"})
        await Education.destroy({ where: { id: ID }})
        return res.sendStatus(200)
    } catch (error) {
        console.error(error.message)
        return res.status(500).json({message: error.message})
    }
}


// ------------------- SKILLS --------------------

export async function GetAllSkills(req:Request, res: Response){
    try {
        const SKILLS = await Skills.findAll()
        const encryptedData = encrypt(SKILLS)
        return res.status(200).json(encryptedData)
    } catch (error) {
        console.error(error)
        return res.status(200).json({message: error.message})
    }
}

export async function AddNewSkill(req:Request, res: Response){
    const skillBody = req.body
    try {
        const SKILLS = await Skills.create(skillBody)
        const encryptedData = encrypt(SKILLS)
        return res.status(200).json(encryptedData)
    } catch (error) {
        console.error(error)
        return res.status(200).json({message: error.message})
    }
}

export async function AddSkillToUser(req:Request, res: Response){
    let skillBody = req.body.skills.split(",")
    const userToken = req.headers.authorization
    try {
        jwt.verify(userToken, process.env.ACCESS_TOKEN_SECRET, async function (err, decoded:any){
            // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
            if(err) return res.status(400).send(err)
            const USER = await User.findOne({where:{id: decoded.id}})
            if(!USER) return res.status(404).json({message: "user not found"})

            const SKILLS = await Skills.findAll({where: { id: skillBody}})
            await USER.setSkills(SKILLS)
            const USER_SKILLS = await USER.getSkills()
            
            return res.status(200).json(USER_SKILLS)
        })
        // await User
        // return res.status(200).json(skillBody)
    } catch (error) {
        console.error(error)
        return res.status(200).json({message: error.message})
    }
}


// -------------------- LOCATION -------------------------

export async function GetAllLocations(req:Request, res: Response){
    try {
        const LOCATIONS = await Locations.findAll()
        const encryptedData = encrypt(LOCATIONS)
        return res.status(200).json(encryptedData)
    } catch (error) {
        console.error(error)
        return res.status(200).json({message: error.message})
    }
}

export async function GetAllUserDomicile(req:Request, res: Response){
    try {
        const LOCATIONS = await User.findAll({attributes: ["domicile"]})
        
        const encryptedData = encrypt(LOCATIONS)
        return res.status(200).json(encryptedData)
    } catch (error) {
        console.error(error)
        return res.status(200).json({message: error.message})
    }
}

export async function AddNewLocation(req:Request, res: Response){
    const locationBody = req.body
    try {
        const LOCATIONS = await Locations.create(locationBody)
        const encryptedData = encrypt(LOCATIONS)
        return res.status(200).json(encryptedData)
    } catch (error) {
        console.error(error)
        return res.status(200).json({message: error.message})
    }
}



// --------------------- ATTACHMENT -------------------

export async function UpdateAttachment(req:Request, res: Response){
    let attachmentData = req.body
    const userToken = req.headers.authorization;

    jwt.verify(userToken, process.env.ACCESS_TOKEN_SECRET, async function (err, decoded:any){
        // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
        if(err) return res.status(400).send(err)
        const USER = await User.findOne({where:{id: decoded.id}, include:[
            {model: Experience, as: "experiences"},
            {model: Education, as: "educations"},
            {model: Attachment, as: "attachments"},
            {model: Socials, as: "socials"},
            {model: Skills, as: "skills"},
            {model: Config, as: "config"}
        ]})
        if(!USER) return res.status(404).json({message: "user not found"})

        const hasAttachments = await USER.getAttachments()

        if(!hasAttachments){
            await USER.createAttachments(attachmentData)
        }else{
            await Attachment.destroy({where: { id: (await USER.getAttachments()).id }})
            const ATTACHMENT = await Attachment.create(attachmentData)
            await USER.setAttachments(ATTACHMENT)
        }

        const newAttachments = await USER.getAttachments()

        return res.status(200).json(newAttachments)
    })
}

export async function UpdateSocials(req:Request, res: Response){
    let socialsData = req.body
    const userToken = req.headers.authorization;

    jwt.verify(userToken, process.env.ACCESS_TOKEN_SECRET, async function (err, decoded:any){
        // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
        if(err) return res.status(400).send(err)
        const USER = await User.findOne({where:{id: decoded.id}, include:[
            {model: Experience, as: "experiences"},
            {model: Education, as: "educations"},
            {model: Attachment, as: "attachments"},
            {model: Socials, as: "socials"},
            {model: Skills, as: "skills"},
            {model: Config, as: "config"}
        ]})
        if(!USER) return res.status(404).json({message: "user not found"})

        const hasSocials = await USER.getSocials()

        if(!hasSocials){
            await USER.createSocials(socialsData)
        }else{
            await Socials.destroy({where: { id: (await USER.getSocials()).id}})
            const SOCIALS = await Socials.create(socialsData)
            await USER.setSocials(SOCIALS)
        }

        const newSocials = await USER.getSocials()

        return res.status(200).json(newSocials)
    })
}


// -------------------- PROFILE PICTURE ---------------------

export async function GetAllProfilePicture(req:Request, res:Response) {
    const files = fs.readdirSync(path.join(__dirname, "..", "..", "public", "img", "ProfilePic"))
    const urlFiles = files.map(file => {
        return `/img/ProfilePic/${file}`
    })
    
    return res.status(200).json(urlFiles)
}

export async function UpdateActiveSearch(req:Request, res: Response){
    let configData = req.body
    const userToken = req.headers.authorization;

    jwt.verify(userToken, process.env.ACCESS_TOKEN_SECRET, async function (err, decoded:any){
        // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
        if(err) return res.status(400).send(err)
        const USER = await User.findOne({where:{id: decoded.id}})
        if(!USER) return res.status(404).json({message: "user not found"})

        const USER_CONFIG = await USER.getConfig()
        if(!USER_CONFIG) return res.status(400).json({message: "user config not found"})
        console.log(USER_CONFIG);
        
        await USER_CONFIG.update(configData)
        
        return res.status(200).json(await USER.getConfig())
    })
}






function calculateTotalExperienceMonth(experiences) {
    let totalMonths = 0;

    experiences.forEach(exp => {
        const startDate = new Date(exp.exp_startdate);
        const endDate = exp.exp_enddate ? new Date(exp.exp_enddate) : new Date();
        
        const yearsDifference = endDate.getFullYear() - startDate.getFullYear();
        const monthsDifference = endDate.getMonth() - startDate.getMonth();

        totalMonths += (yearsDifference * 12) + monthsDifference;
    });

    return totalMonths
}