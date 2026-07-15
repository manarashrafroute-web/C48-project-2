import mongoose from "mongoose"



const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
        trim: true,
        minLength: [3, "must be gretter than 3"],
        maxLength: [100, "<100"]
    },
    content: {
        type: String,
        require: true,
        minLength: [6, "must be gretter than 6"],
        maxLength: [50000, "<50"]
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    }
}, {
    timestamps: true
})


const Note = mongoose.model("Note", noteSchema)

export default Note