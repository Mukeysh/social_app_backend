const express = require("express");
const router = express.Router();
const {
    createPost,
    likeAndUnlikePost,
    deletePost,
    followingPosts,
    updateCaption,
    addComment,
    updateComment,
    deleteComment,
} = require("../controllers/post");
const { isAuthenticated } = require("../middleware/auth");

router.post("/post/upload", isAuthenticated, createPost);
router.get("/post/:id", isAuthenticated, likeAndUnlikePost);
router.delete("/post/:id", isAuthenticated, deletePost);
router.put("/post/:id", isAuthenticated, updateCaption);
router.get("/posts/", isAuthenticated, followingPosts);
router.post("/add/comment/:id", isAuthenticated, addComment);
router.post("/update/comment/:id/:commentId", isAuthenticated, updateComment);
router.delete("/delete/comment/:id/:commentId", isAuthenticated, deleteComment);

module.exports = router;
