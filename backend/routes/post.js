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
    userPosts,
    userPost,
    allPosts,
    singlePost,
    allPostsExceptUser
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
router.get("/user/posts", isAuthenticated, userPosts);
// router.get("/user/posts/:id", isAuthenticated, userPost);
router.get("/all/posts", isAuthenticated, allPosts);
router.get("/single/post/:id", isAuthenticated, singlePost);
router.get("/all/posts/except/user", isAuthenticated, allPostsExceptUser);

module.exports = router;
