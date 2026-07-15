import multer from "multer"
import fs from "node:fs"

// or memory storage

export let extinstions = {
    image: ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"],
    vedio: ["video/mp4", "video/mov", "video/webp"],
    pdf: ["application/pdf"],
    excel: ["appliaction/vnd.opnxmlformats-officedoument.spreadssheetml.sheet"]
}


export let multerLocal = ({ customPath, allowedType } = { customPath: "general" }) => {
    let storage = multer.diskStorage({
        destination: function (req, file, cb) { // where i can save file
            //2
            let filesPath = `upload/${customPath}` // folder 
            if (!fs.existsSync(filesPath)) {
                fs.mkdirSync(filesPath,
                    { recursive: true } // allow muliple folders
                )
            }
            cb(null, `upload/${customPath}`)


            // cb(null, `upload`)
        },
        filename: function (req, file, cb) {
            // console.log(file);

            // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            // cb(null, file.originalname + '-' + uniqueSuffix)
            let prefix = Date.now()
            let fileName = `${prefix}-${file.originalname}`
            cb(null, fileName)
        }
    })

    let fileFilter = function (req, file, cb) {
        // let fileType = file.mimetype.split("/")[0]
        // console.log(fileType);
        //1- cb(null, ture)
        // 2- if (fileType == "image") {
        //     cb(null, true)
        // } else {
        //     cb("wrong type", false)
        // }

        // console.log(allowedType);
        // console.log(file.mimetype);


        if (allowedType.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb("wrong type", false)
        }
    }

    return multer({
        storage, fileFilter, limits: {
            fileSize: 5 * 1024 * 1024 // 5mg,

        }
    })
}




export let multer_cloud = (allowedType = []) => {
    let storage = multer.diskStorage({
        filename: function (req, file, cb) {
            cb(null, file.originalname) // multer
        }
    })

    let fileFilter = function (req, file, cb) {

        if (allowedType.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb("wrong type", false)
        }
    }

    const upload = multer({ storage })
    return upload
}







// 1-
// export let multerLocal = () => {
//     return multer({ dest: "upload" })
// }

// cloudinary free , servers
// aws
