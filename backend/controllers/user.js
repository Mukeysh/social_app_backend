const User = require("../models/User");
const Post = require("../models/Post");
const { sendEmail } = require("../middleware/sendEmail");
const crypto = require("crypto");
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user)
            return res
                .status(400)
                .json({ status: "error", message: "User already exists" });
        user = await User.create({ name, email, password });
        const { password: pass, ...info } = user._doc;
        res.status(201).json({
            status: "success",
            data: info,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        //check if email exists
        const user = await User.findOne({ email });
        console.log(user);
        if (!user) {
            return res.status(400).json({
                status: "error",
                message: "User does not exist",
            });
        }
        // check if password is correct
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({
                status: "error",
                message: "Incorrect password",
            });
        }
        //generate token
        const token = await user.generateToken();
        const { password: pass, ...info } = user._doc;
        res.status(200)
            // .cookie("token", token, {
            //     expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            //     httpOnly: true,
            //     sameSite: "strict",
            //     path: "/",
            // })
            .json({
                status: "success",
                user: info,
                token,
            });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
};

exports.logOut = async (req, res) => {
    try {
        res.status(200)
            .cookie("token", null, {
                expires: new Date(Date.now()),
                httpOnly: true,
            })
            .json({
                status: "success",
                message: "Logged out",
            });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
};

exports.followUser = async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const loggedInUser = await User.findById(req.user._id);
        if (!userToFollow) {
            return res.status(400).json({
                status: "false",
                message: "User not found",
            });
        }
        if (loggedInUser.following.includes(userToFollow._id)) {
            const indexFollowing = loggedInUser.following.indexOf(
                userToFollow._id
            );
            const indexFollowers = userToFollow.followers.indexOf(
                loggedInUser._id
            );

            loggedInUser.following.splice(indexFollowing, 1);
            userToFollow.followers.splice(indexFollowers, 1);

            await loggedInUser.save();
            await userToFollow.save();
            res.status(200).json({
                status: "Success",
                messgae: "User unfollowed",
            });
        } else {
            loggedInUser.following.push(userToFollow._id);
            userToFollow.followers.push(loggedInUser._id);
            await loggedInUser.save();
            await userToFollow.save();
            res.status(200).json({
                status: "Success",
                messgae: "User followed",
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                status: "error",
                message: "Please provide old and new password",
            });
        }
        if (!user) {
            res.status(500).json({
                status: "error",
                message: "user not found",
            });
        }
        const isMatch = await user.matchPassword(oldPassword);

        if (!isMatch) {
            return res.status(400).json({
                status: "failed",
                message: "incorrect old password",
            });
        }
        user.password = newPassword;
        await user.save();
        res.status(200).json({
            status: "Success",
            message: "password changed successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { name, email } = req.body;
        if (!user) {
            res.status(500).json({
                status: "error",
                message: "user not found",
            });
        }
        if (name) {
            user.name = name;
        }
        if (email) {
            user.email = email;
        }

        //user avatar todo
        await user.save();
        res.status(200).json({
            status: "success",
            message: "profile updated",
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
};
exports.deleteProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const post = user.posts;
        const followers = user.followers;
        const following = user.following;
        const userId = user._id;
        if (!user) {
            res.status(500).json({
                status: "error",
                message: "user not found",
            });
        }
        await user.remove();

        // logout user after delete profile
        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
        });

        // remove all posts of user
        for (let i = 0; i < post.length; i++) {
            const post = await Post.findById(post[i]);
            await post.remove();
        }

        //remove user from following
        for (let i = 0; i < followers.length; i++) {
            const follower = await User.findById(followers[i]);
            const index = follower.following.indexOf(userId);
            follower.following.splice(index, 1);
            await follower.save();
        }

        // remove user from followers
        for (let i = 0; i < following.length; i++) {
            const follows = await User.findById(following[i]);
            const index = follows.followers.indexOf(userId);
            follows.followers.splice(index, 1);
            await follows.save();
        }
        res.status(200).json({
            status: "success",
            message: "profile deleted",
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
};

exports.myProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("posts");
        if (!user) {
            return res.status(500).json({
                status: "error",
                message: "user not found",
            });
        }
        const { password: pass, ...info } = user._doc;
        res.status(200).json({
            status: "success",
            user: info,
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
};
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("posts");
        if (!user) {
            return res.status(500).json({
                status: "error",
                message: "user not found",
            });
        }
        res.status(200).json({
            status: "success",
            data: {
                user,
            },
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
};
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json({
            status: "success",
            data: {
                users,
            },
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
};
exports.forgetPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({
                status: "error",
                message: "user not found",
            });
        }
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${req.protocol}://${req.get(
            "host"
        )}/api/v1/reset/Password/${resetToken}`;
        const message = `Please use the following link to reset your password \n\n ${resetUrl}`;
        try {
            await sendEmail({
                email: user.email,
                subject: "Password reset token",
                message,
            });
            res.status(200).json({
                status: "success",
                message: "Email sent",
            });
        } catch (err) {
            console.log(err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            res.status(500).json({
                status: "error email not sent",
                message: err.message,
            });
        }
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
};
exports.resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex");
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(400).json({
                status: "error",
                message: "token is invalid or has expired",
            });
        }
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        res.status(200).json({
            status: "success",
            message: "password reset",
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
};
