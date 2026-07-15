import express from "express"
import userController from "./modules/user/user.controller.js"
import noteController from "./modules/note/note.controller.js"
import dbConnection from "./DB/connection.js"
import { port } from "./config/config.service.js"
import cors from "cors"


export default async () => {

    const app = express()
    const PORT = port
    app.use(express.json())

    app.use("/upload", express.static("upload"))

    app.use(cors())
    dbConnection()


    app.use("/users", userController)
    app.use("/notes", noteController)


    app.get("/", (req, res) => {
        res.status(200).json({
            message: "Hello "
        })
    })


    app.use((req, res, next) => {
        res.status(404).json({
            message: "Router not found "
        })
    })

    app.use((err, req, res, next) => { // 
        res.status(500).json({
            stack: err.stack,
            message: err.message
        })
    })

    app.listen(PORT, () => {
        console.log(`server is running at port ::: ${PORT}`);

    })

}

