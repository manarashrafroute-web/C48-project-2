import { isValidObjectId } from "mongoose"
import User from "../../../DB/models/user.model.js"
import jwt from "jsonwebtoken"
import { ACCESS_EXPIRE_TOKEN, E_secret, Refresh_EXPIRE_TOKEN, SALT_ROUNDS, secret_key } from "../../../config/config.service.js"
import CryptoJS from "crypto-js"
import { compareSync, hashSync } from "bcrypt"
import { OAuth2Client } from "google-auth-library"
import cloudinary from "../../../common/utils/coludinery.js"


export const RegistertionService = async (data, file) => {

    //email 
    const isEmailExists = await User.findOne({ email: data.email })

    if (isEmailExists) return "EmailExists"

    // hash password --- one way func 
    console.log(typeof SALT_ROUNDS);

    const hashingPassword = hashSync(data.password, parseInt(SALT_ROUNDS))


    //encryption phone - two way function 
    const encryptPhone = CryptoJS.AES.encrypt(data.phone, E_secret).toString()
    const userData = {
        name: data.name,
        lastName: data.lastName,
        email: data.email,
        password: hashingPassword,
        phone: encryptPhone,
        age: data.age,
        gender: data.gender,
        isActive: data.isActive,
        image: data.image // optional 
    }

    const user = await User.create(userData)

    // image optional // public id , secure url >> cloudinary >>> userId

    if (file) {
        let { public_id, secure_url } = await cloudinary.uploader.upload(file.path, {
            folder: `users/${user._id}/profileImage`,
            resource_type: "image"
        })

        user.profileImage = {
            public_id, secure_url
        }

        await user.save()
    }


    const { password, phone, ...safeUser } = user.toObject()

    return {
        ...safeUser
    }


}

// remove profile imag 





export const LoginService = async (data) => {

    // email 
    if (!data.email) return "youMustUseEmail"

    const user = await User.findOne({
        email: data.email
    })

    console.log(user);


    if (!user) return "userNotFound"

    // password 

    const comperPassord = await compareSync(data.password, user.password)

    if (!comperPassord) {
        return "wrongCredintial"
    }

    //generate access token 
    const accessToken = jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role
        },
        secret_key,
        // { expiresIn: ACCESS_EXPIRE_TOKEN }

    )

    const refreashToken = jwt.sign(
        {
            id: user._id,
        },
        secret_key,
        // { expiresIn: Refresh_EXPIRE_TOKEN }

    )


    return {
        success: true,
        user: {
            id: user._id,
            email: user.email,
            role: user.role
        },
        tokes: {
            accessToken,
            refreashToken,
            // expiresIn: ACCESS_EXPIRE_TOKEN
        }
    }


}



export const RefreshTokeService = async (refreshtoken) => {

    // email 
    if (!refreshtoken) return {
        success: false,
        message: "refreshTokenRequired"
    }

    let decoded
    try {
        decoded = jwt.verify(refreshtoken, secret_key)
    } catch (error) {
        return {
            success: false,
            message: "InvalidToken"
        }
    }

    const user = await User.findById(decoded.id)

    if (!user) return {
        success: false,
        message: "userNotFund"
    }

    //generate access token 
    const newAccessToken = jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role
        },
        secret_key,
        { expiresIn: ACCESS_EXPIRE_TOKEN }
    )

    const refreashToken = jwt.sign(
        {
            id: user._id,
        },
        secret_key,
        { expiresIn: Refresh_EXPIRE_TOKEN }

    )


    return {
        success: true,
        tokes: {
            newAccessToken,
            refreashToken,
            expiresIn: ACCESS_EXPIRE_TOKEN
        }
    }


}


// example@gmail.com /// verfiyed // idtoken >>> payload >>> user >>> signup // idToken >>> frontend


async function verifyGoogleAccount({ idToken }) {
    const client = new OAuth2Client()
    const ticket = await client.verifyIdToken({
        idToken
    })

    const payload = ticket.getPayload() // id ,email , name , avater

    return payload
}



export const SignUpWithGoogleService = async (googleData) => {

    const { idToken } = googleData
    console.log(idToken);

    const payload = await verifyGoogleAccount({ idToken })
    console.log(payload);

    if (!payload.email_verified) return { error: "emailNotVirified" }

    const isEmailExists = await User.findOne({ email: payload.email })

    if (isEmailExists) return LoginWithGoogleService(googleData)

    const userData = {
        name: payload.given_name,
        lastName: payload.family_name,
        email: payload.email,
        isActive: true,
        avatar: payload.picture
    }

    const newUser = await User.create(userData)

    return {
        success: true,
        message: "sign up with google successflly",
        user: newUser
    }

}




export const LoginWithGoogleService = async (googleData) => {

    const { idToken } = googleData
    console.log(idToken);

    const payload = await verifyGoogleAccount({ idToken })
    console.log(payload);

    if (!payload.email_verified) return { error: "emailNotVirified" }

    const user = await User.findOne({
        email: payload.email  // database
    })

    if (!user) return SignUpWithGoogleService(googleData)

    return {
        success: true,
        message: "user Login with google successflly",
        user
    }
}

export const ListUserService = async (data) => {

    const users = await User.find()

    if (!users) return "nousersfound"


    return users

}



export const GetUserByIdService = async (userId) => {

    if (!isValidObjectId(userId)) return "invalid"

    const user = await User.findById(userId)

    if (!user) return "nouserfound"

    // decrept phone 
    if (user?.phone) {
        const decryptPhone = CryptoJS.AES.decrypt(user.phone, E_secret)
        // console.log(decryptPhone);
        user.phone = decryptPhone.toString(CryptoJS.enc.Utf8)


    }


    return user

}


export const UpdateuserService = async (userId, updatedData) => {

    const user = await User.findById(userId)

    if (!user) return "userNotFound"

    const forbiddenfileds = ["_id", "createdAt", "updatedAt", "_v"]

    forbiddenfileds.forEach(field => {
        delete updatedData[field]
    })

    if (updatedData.email && updatedData.email !== user.email) {
        const isEmailExists = await User.findOne({ email: updatedData.email })

        if (isEmailExists) return "EmailExists"
    }

    console.log(updatedData);


    //encryption phone 

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updatedData },
        { new: true }
    )

    return updatedUser

}



export const DeleteUserByIdService = async (userId) => {

    if (!isValidObjectId(userId)) return "invalid"

    const deleteduser = await User.findByIdAndDelete(userId)
    if (!deleteduser) return "nouserfound"
    // hard delete user 
    // const deletedUser = await User.findByIdAndDelete(userId)
    // console.log(deletedUser);

    //soft delete 
    // const deletedUser = await User.findByIdAndUpdate(
    //     userId,
    //     {
    //         $set: {
    //             isdelted: true,
    //             deletedAt: new Date()
    //         }
    //     },
    //     { new: true }
    // )

    if (deleteduser) {
        await cloudinary.api.delete_resources_by_prefix(`users/${deleteduser.id}/profileImage`)
        await cloudinary.api.delete_folder(`users/${deleteduser.id}`).catch((err) => {
            console.log(err)
            console.log(err.message);
            console.log(err.stack);
        })
    }




    return {
        message: "user deleted successflly",
        userId: deleteduser._id
    }

}






// reset password 


//remove profile image
export const RemoveProfileIamgeServices = async (req) => {

    const { profileImage } = await User.findOne({ _id: req.user._id }).select("profileImage -_id")

    const data = await cloudinary.uploader.destroy(profileImage.public_id)

    await User.findOneAndUpdate({ _id: req.user.id }, { $set: { profileImage: {} } })

    return data


}



export const AddProfileIamgeServices = async (req) => {

    let { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, {
        folder: `users/${req.user._id}/profileImage`,
        resource_type: "image"
    })

    const data = await User.findOneAndUpdate({ _id: req.user.id }, { $set: { profileImage: { public_id, secure_url } } })

    return data


}




export const UpdatePasswordServices = async (req) => {

    let { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, {
        folder: `users/${req.user._id}/profileImage`,
        resource_type: "image"
    })

    const data = await User.findOneAndUpdate({ _id: req.user.id }, { $set: { profileImage: { public_id, secure_url } } })

    return data


}


export const ForgetPasswordServices = async (req) => {

    let { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, {
        folder: `users/${req.user._id}/profileImage`,
        resource_type: "image"
    })

    const data = await User.findOneAndUpdate({ _id: req.user.id }, { $set: { profileImage: { public_id, secure_url } } })

    return data


}

