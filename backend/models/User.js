const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    avatar: {
        type: String,
        public_id: String,
        default: "https://i.imgur.com/kZypAmC.png",
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email is already in use"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 6 characters"],
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post", // ref is the name of the model
        },
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        },
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
});

userSchema.pre("save", async function (next) {
    try {
        if (!this.isModified("password")) return next();
        const hash = await bcrypt.hash(this.password, 10);
        this.password = hash;
        next();
    } catch (err) {
        console.log(err);
        next(err);
    }
});

userSchema.methods.matchPassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (err) {
        console.log(err);
    }
};

userSchema.methods.generateToken = async function () {
    try {
        const token = await jwt.sign({ id: this._id }, process.env.JWT_SECRET);
        return token;
    } catch (err) {
        console.log(err);
    }
};

userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model("User", userSchema);
