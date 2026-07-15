
import { configDotenv } from "dotenv"
import path from "path"


// dev , prod

const nodeenv = process.env.NODE_ENV


let envpath = ""
//switch 
// switch (nodeenv) {
//     case "development":
//         envpath = "./src/config/.env.development"
//         break;

//     case "production":
//         envpath = "./src/config/.env.production"
//         break;
//     default:
//         throw new Error("node env not defined")
// }

if (nodeenv == "production") {
    envpath = "./src/config/.env.production"
} else if (nodeenv == "development") {
    envpath = "./src/config/.env.development"
} else {
    throw new Error("node env not defined")
}




configDotenv({ path: path.resolve(`./src/config/.env.${nodeenv}`) })

export let port = process.env.PORT

export let DB_URI = process.env.LOCAL_DB_URI

export const secret_key = process.env.JWT_SECRET

export const sceret = process.env.TOKEN_SECRET

export const E_secret = process.env.ENCRYPTION_SECERT_KEY

export const ACCESS_EXPIRE_TOKEN = process.env.ACCESS_EXPIRE_TOKEN

export const Refresh_EXPIRE_TOKEN = process.env.Refresh_EXPIRE_TOKEN

export const SALT_ROUNDS = process.env.SALT_ROUNDS

export const client_id = process.env.Client_ID

export const cloud_name = process.env.CLOUD_NAME

export const cloud_secret = process.env.CLOUDNERY_API_SECRET

export const cloud_key = process.env.CLOUDINERY_API_KEY


