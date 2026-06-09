import jwt from "jsonwebtoken";

const Auth=(req,res,next)=>{
    const token=req.header.authorization;
    if(!token){
        return res.status(401).json({message : "UnAuthorize"});
    }
    try {
        const decode=jwt.verify(token,process.env.Secrate);
        req.user=decode
        next();
    } catch (error) {
        return res.status(500).json({message:error.message});
    }
}