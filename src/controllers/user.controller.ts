import jwt from "jsonwebtoken"
import User from "../models/User"
import { Request, Response } from "express"
import { createToken } from "../config/JWT"
import { encrypt } from "../config/crypto"
import { jwtDecode } from "jwt-decode";
import Experience from "../models/UserExperience"
import Education from "../models/UserEducation"

export function VerifyJWT(req:Request, res:Response){
    const accessToken = req.headers.authorization
    try {
        // if(!accessToken) return res.status(400).json({message: "access token doesn't exist"})
        if(!accessToken) return res.status(200).send(false)
        jwt.verify(accessToken.toString(), process.env.ACCESS_TOKEN_SECRET, async function (err, _){
            // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
            if(err) return res.status(200).send(false)

            return res.status(200).json(true)
        })
    } catch (error) {
        
    }
}

export async function GetUserByToken(req:Request, res: Response){
    const userToken:any = req.headers.authorization;

    try {
        jwt.verify(userToken, process.env.ACCESS_TOKEN_SECRET, async function (err, user:any){
            // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
            if(err) return res.status(400).json(err.message)
            const USER = await User.findOne({where:{id: user.id}, include: [
                {model: Experience, as: "experiences"},
                {model: Education, as: "educations"},
            ]})
            if(!USER) return res.status(404).json({message: "user not found"})

            const encryptedData = encrypt(USER, process.env.AES_KEYS)
            return res.status(200).json(encryptedData)
        })
    } catch (error) {
        console.error(error)
        return res.status(200).json({message: error.message})
    }
}

export async function GetExperiencesByUserToken(req:Request, res: Response){
    const userToken:any = req.headers.authorization;
    try {
        jwt.verify(userToken, process.env.ACCESS_TOKEN_SECRET, async function (err, user:any){
            // if(err) return res.status(200).json({message: "Unauthorized, refresh token invalid"})
            if(err) return res.status(200).send(false)
            const USER = await User.findOne({where:{id: user.id}})

            const EXPERIENCES = await USER.getExperiences()
            const encryptedData = encrypt(EXPERIENCES)
            return res.status(200).json(encryptedData)
        })
    } catch (error) {
        console.error(error)
        return res.status(200).json({message: error.message})
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
            const USER = await User.findOne({where:{id: decoded.id}})
            if(!USER) return res.status(404).json({message: "user not found"})
            USER.update(userData)

            return res.status(200).json(USER)
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: error.message})
    }
}

export async function GoogleLoginHandler(req:Request, res: Response){
    let data = req.body  
    let userData:any = jwtDecode(data.token);

    const USER = await User.findOne({where: { email: userData.email }})
    if(USER){
        const accessToken = createToken(USER)
        res.cookie("userAuthenticate", accessToken, {
            maxAge: 360000000,
        });
        return res.status(200).json(accessToken)
    }
    if(!USER){
        const NEW_USER = await User.create({
            email: userData.email,
            profile_picture: userData.picture,
            firstname: userData.given_name,
            lastname: userData.family_name
        })
        const accessToken = createToken(NEW_USER)
        res.cookie("userAuthenticate", accessToken, {
            maxAge: 360000000,
        });
        return res.status(200).json(accessToken)
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
        let EXPERIENCES = await USER.getExperiences()

        return res.status(200).json(EXPERIENCES)
    })
}

