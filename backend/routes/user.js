const express = require("express");
const router = express.Router();
const {
    register,
    login,
    followUser,
    logOut,
    updatePassword,
    updateProfile,
    deleteProfile,
    myProfile,
    getAllUsers,
    getUserProfile,
    forgetPassword,
    resetPassword,
} = require("../controllers/user");
const { isAuthenticated } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/follow/:id", isAuthenticated, followUser);
router.get("/logout", isAuthenticated, logOut);
router.put("/update/password/", isAuthenticated, updatePassword);
router.put("/update/profile/", isAuthenticated, updateProfile);
router.delete("/delete/me/", isAuthenticated, deleteProfile);
router.get("/profile", isAuthenticated, myProfile);
router.get("/users", isAuthenticated, getAllUsers);
router.get("/user/:id", isAuthenticated, getUserProfile);
router.get("/forget/password", forgetPassword);
router.put("/reset/password/:token", resetPassword);

module.exports = router;
