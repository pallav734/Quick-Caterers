import jwt from "jsonwebtoken";

export const requireSignIn = async(req,res,next)=>{
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).send("Unauthorized");
        }
        const token = authHeader.split(" ")[1];
        const decode = jwt.verify(token , process.env.JWT_SECRET);
        req.user = decode;
        next();
    } catch (error) {
        return res.status(401).send("Invalid token");
    }
}