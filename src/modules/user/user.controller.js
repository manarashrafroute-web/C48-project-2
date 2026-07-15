import { Router } from "express";
import * as userServices from "./services/user.services.js";
import { auth } from "../../common/middleware/auth.middleware.js";
import { extinstions, multer_cloud, multerLocal } from "../../common/middleware/multermiddleware.js";
import cloudinary from "../../common/utils/coludinery.js";

const userController = Router()


// uplload image // user._id // >>>>> users/userid/profile


userController.post("/cloudinery", auth, multer_cloud({ allowedType: extinstions.image }).single("image"), async (req, res) => {

    const data = await cloudinary.uploader.upload(req.file.path, {
        // // public_id: "profile-image" // profile,
        // resource_type: "image", // pdf ,
        // // allowed_formats : ["jpeg"]
        // // use_filename : true,
        // // unique_filename : false,
        // // transformation: [{ width: 300, height: 300, crop: "fill" }]
        // eager: [
        //     { width: 300, height: 300, crop: "fill" },
        //     { width: 500, height: 500, crop: "fill" },
        //     { width: 600, height: 600, crop: "fill" }
        // ]
        folder: `users/${req.user._id}/profile`
    })

    return res.status(200).json({ message: "done", data })

})



// multer


userController.post("/single", multerLocal({
    customPath: "profile-Images/usres", allowedType: extinstions.image  // extinstions.image [...extinstions.image, ...extinstions.pdf] 
})
    .single("image"), async (req, res) => {

        // fE >>>> http://localhost/ 
        console.log(req);

        let baseUrl = `${req.protocol}://${req.host}/`
        req.file.finalPath = `${baseUrl}${req.file.destination}/${req.file.filename}` // to get the file path
        return res.status(200).json({ message: "done", file: req.file, body: req.body })

    })


userController.post("/array", multerLocal({ customPath: "array" }).array("image", 2), async (req, res) => {

    console.log(req.host);
    console.log(req.hostname);
    console.log(req.protocol);

    let baseUrl = `${req.protocol}://${req.host}/`

    return res.status(200).json({
        message: "done",
        files: req.files.map((file) => {
            file.finalPath = `${baseUrl}${file.destination}/${file.filename}`
            return file
        }),
        body: req.body
    })

})


userController.post("/fields", multerLocal({ customPath: "fields" }).fields([
    { name: "profile", maxCount: 1 },
    { name: "cover", maxCount: 2 },
    { name: "cv", maxCount: 1 }
]),
    async (req, res) => {


        let baseUrl = `${req.protocol}://${req.host}/`

        let fields = ["profile", "cover", "cv"] // { profile :[] , }

        for (let i = 0; i < fields.length; i++) {
            req.files[fields[i]] = req.files[fields[i]].map((file) => {
                file.finalPath = `${baseUrl}${file.destination}/${file.filename}`
                return file
            })
        }

        return res.status(200).json({
            message: "done",
            files: req.files
        })

    })

userController.post("/any", multerLocal({ customPath: "any" }).any(), async (req, res) => {
    return res.status(200).json({
        message: "done",
        files: req.files
    })

})

userController.post("/none", multerLocal().none(), async (req, res) => { // form data >> file
    return res.status(200).json({
        message: "done",
        body: req.body
    })

})

userController.post("/register", multer_cloud({ allowedType: extinstions.image }).single("image"), async (req, res) => {

    const data = await userServices.RegistertionService(req.body, req.file) // form data

    if (data === "EmailExists") {
        return res.status(409).json({ message: "email already exists " })
    }

    return res.status(200).json({ message: " userSignUp successflly", user: data })
})


userController.post("/register/gmail", async (req, res) => {

    const data = await userServices.SignUpWithGoogleService(req.body)

    if (data === "emailNotVirified") {
        return res.status(409).json({ message: "you must verify your email" })
    }

    if (data === "EmailExists") {
        return res.status(409).json({ message: "email already exists " })
    }

    return res.status(200).json({ message: "loginn", data })
})


userController.post("/login/gmail", async (req, res) => {

    const data = await userServices.LoginWithGoogleService(req.body)

    if (data === "userNotfound") {
        return res.status(404).json({ message: "user not found" })
    }

    return res.status(200).json({ message: "success", data })
})

userController.post("/log-in", async (req, res) => {

    const data = await userServices.LoginService(req.body) // email , password

    if (data === "youMustUseEmail") {
        return res.status(402).json({ message: "emial is Required" })
    }

    if (data === "userNotFound") {
        return res.status(404).json({ message: "user not found" })
    }

    if (data === "wrongCredintial") {
        return res.status(404).json({ message: "email or password  wrong" })
    }

    return res.status(200).json({ message: " user LogIn successflly", data })
})


userController.post("/refresh-token", async (req, res) => {

    const refreshtoken = req.headers.authorization.split(" ")[1]


    const data = await userServices.RefreshTokeService(refreshtoken)

    if (!data.success) {
        return res.status(402).json({
            success: false,
            message: data.message
        })
    }

    return res.status(200).json({ message: " user LogIn successflly", data })
})



userController.get("/all-users", async (req, res) => {

    const data = await userServices.ListUserService()

    if (data === "nousersfound") {
        return res.status(404).json({ message: "users not found", users: [] })
    }


    return res.status(200).json({ message: " users", users: data })
})


userController.get("/get-user", auth, async (req, res) => {

    const data = await userServices.GetUserByIdService(req.user._id)

    if (data === "invalid") {
        return res.status(404).json({ message: "id not valid " })
    }

    if (data === "nouserfound") {
        return res.status(404).json({ message: "users not found" })
    }


    return res.status(200).json({ message: "user Profile", user: data })
})


userController.put("/update-user", auth, async (req, res) => {

    const data = await userServices.UpdateuserService(req.user._id, req.body)


    if (data === "userNotFound") {
        return res.status(404).json({ message: "user not found" })
    }

    if (data === "EmailExists") {
        return res.status(409).json({ message: "email already exists " })
    }

    return res.status(200).json({ message: " user updated successflly", user: data })
})


userController.delete("/delete-user", auth, async (req, res) => {

    const data = await userServices.DeleteUserByIdService(req.user._id)

    if (data === "invalid") {
        return res.status(404).json({ message: "id not valid " })
    }

    if (data === "nouserfound") {
        return res.status(404).json({ message: "users not found" })
    }


    return res.status(200).json({ message: "user delted", deltedUser: data })
})




export default userController


// refresh token

// hashing

// getter - setter

// hooks  , >> user >> post >> comment >> reply > react



userController.delete("/remove-image", auth, async (req, res) => {

    const data = await userServices.RemoveProfileIamgeServices(req)

    return res.status(200).json({ message: " userSignUp successflly", user: data })
})



userController.post("/add-image", auth, multer_cloud({ allowedType: extinstions.image }).single("image"), async (req, res) => {

    const data = await userServices.AddProfileIamgeServices(req)

    return res.status(200).json({ message: " userSignUp successflly", user: data })
})