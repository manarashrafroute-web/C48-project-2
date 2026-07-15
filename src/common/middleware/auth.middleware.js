import { sceret, secret_key } from "../../config/config.service.js"
import jwt from "jsonwebtoken"
import User from "../../DB/models/user.model.js"

export const auth = async (req, res, next) => {
    try {
        //
        const { authorization } = req.headers
        // console.log(authorization);
        if (!authorization) {
            return res.status(401).json({ message: " authorization token is require" })
        }
        // console.log({authorization});
        let token = authorization.split(" ") // [1]
        // console.log({token});

        if (token[0] !== sceret || !token[1]) {
            return res.status(401).json({ message: "invalid token , jwt is exprie" })
        }

        const data = jwt.verify(token[1], secret_key)

        // console.log(data);
        // id 
        let user = await User.findById(data.id)
        // console.log(user);

        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }

        req.user = user
     
        next()
    } catch (error) {
        throw new Error("invalid token , jwt expire")
    }

}