import { decrypt } from "./crypto"

export function decryptAES(req, res, next){
    console.log(req.body);
    req.body = JSON.parse(decrypt(req.body.d))
    
    next()
}