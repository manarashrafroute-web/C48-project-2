import mongoose from "mongoose"
import { DB_URI } from "../config/config.service.js";


const dbConnection = async () => {


    await mongoose.connect(DB_URI).then(() => {
        console.log("dataBase connected")

    }).catch((err) => {
        console.log("error to connect db", err);

    })

}


export default dbConnection