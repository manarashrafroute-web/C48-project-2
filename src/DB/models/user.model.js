import { hashSync } from "bcrypt"
import mongoose from "mongoose"
import { SALT_ROUNDS } from "../../config/config.service.js"


// name , email , age phone , gender , is Active 
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true,
        minLength: [3, "must be gretter than 3"],
        maxLength: [50, "<50"],
        set: function (value) { //manar >>> Manar
            return value.trim().charAt(0).toUpperCase() + value.slice(1).toLowerCase()
        }
    },
    lastName: String,
    email: {
        type: String,
        require: true,
        index: {
            name: "email_unique",
            unique: true
        },
        //set : value => value.toLowerCase(),
        get: value => value.toUpperCase(),
    },
    phone: {
        type: String
    },
    password: {
        type: String,
        require: true,
        minLength: [6, "must be gretter than 6"],
        // set: value => hashSync(value, parseInt(SALT_ROUNDS))
    },
    age: {
        type: Number,
        min: 18,
        maax: 60
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        default: "male"
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    isActive: { // active 
        type: Boolean,
        default: false
    },
    isdelted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    },
    image: {
        type: String
    },
    profileImage: {
        public_id: String,
        secure_url: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})


// userSchema.virtual("fullName").get(function () {
//     return this.name + "  " + this.lastName
// })

// userSchema.pre("save", async function () {
//     //register , update password
//     if (!this.isModified("password")) throw new Error("you must update password")
//     console.log(this.password);

//     this.password = await hashSync(this.password, parseInt(SALT_ROUNDS))

// })


userSchema.post("save", async function (doc) { // document

    console.log(`User ${doc.email} has been registerd `);

})


// userSchema.pre( ["findOne" ,"find"], async function (doc) { // document
//     this.select("email name password  _id")
// })







const User = mongoose.model("User", userSchema)

export default User