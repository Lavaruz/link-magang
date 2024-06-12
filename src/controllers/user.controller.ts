import jwt from "jsonwebtoken"
import User from "../models/User"
import { Request, Response } from "express"

export function VerifyJWT(req:Request, res:Response){
    const accessToken = req.cookies["access-token"]
    try {
        if(!accessToken) return res.status(400).json({message: "access token doesn't exist"})
        // if(!accessToken) return res.status(400).send(false)
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async function (err, _){
            if(err) return res.status(400).json({message: "Unauthorized, refresh token invalid"})
            // if(err) return res.status(400).send(false)

            return res.status(200).json({accessToken})
            // return res.status(200).send(true)
        })
    } catch (error) {
        
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

export async function UpdateUser(req:Request, res: Response){
    const userData = req.body
    try {
        if(!userData.email) return res.status(400).json({message: "email is required"})

        const USER = await User.findOne({where:{email: userData.email}})

        if(!USER) return res.status(404).json({message: "user not found"})

        USER.update(userData)

        return res.sendStatus(200)
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: error.message})
    }
}