const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.isAuthenticated = async (req, res, next) => {
    try {
        // const token = req.cookies.token;
        const token = await req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                status: "error",
                message: "You are not logged in",
            });
        }
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                status: "error",
                message: "You are not logged in as user",
            });
        }
        req.user = user;
        next();
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
};
