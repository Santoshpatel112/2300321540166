import jwt from "jsonwebtoken";

const getToken =(id)=>{
    return jwt.sign({id},process.env.Secrate),{
        expireIn:"7d",
    }
}
export default getToken;