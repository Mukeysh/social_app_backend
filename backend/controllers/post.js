const Post = require("../models/Post");
const User = require("../models/User");
const cloudinary = require("cloudinary");

exports.createPost = async (req, res) => {
    try {
        // const myCloud = await cloudinary.v2.uploader.upload(req.body.image,{
        //     folder: "posts",
            
        // });
        const newPostData = {
            caption: req.body.caption,
            image: {
                url: req.body.image.url,
                public_id: req.body.image.public_id,
            },
            owner: req.user._id,
            location: {
                lat: req.body.location.lat,
                lng: req.body.location.lng,
            },
        };

        const post = await Post.create(newPostData);

        const user = await User.findById(req.user._id);

        user.posts.unshift(post._id);

        await user.save();

        res.status(201).json({
            status: "success",
            data: {
                post,
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                status: "error",
                message: "Post not found",
            });
        }
        if (post.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                status: "error",
                message: "You are not authorized to delete this post",
            });
        }
        await cloudinary.v2.uploader.destroy(post.image.public_id);
        await post.remove();

        const user = await User.findById(req.user._id);
        const index = user.posts.indexOf(post._id);
        user.posts.splice(index, 1);
        await user.save();

        return res.status(200).json({
            status: "success",
            message: "Post deleted",
        });
    } catch (err) {
        console.log(err);
        res.json({
            status: "error",
            message: err.message,
        });
    }
};
exports.likeAndUnlikePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                status: "error",
                message: "Post not found",
            });
        }
        if (post.likes.includes(req.user._id)) {
            const index = post.likes.indexOf(req.user._id);
            post.likes.splice(index, 1);
            await post.save();
            return res.status(200).json({
                status: "success",
                message: "Post unliked",
                data: {
                    post,
                },
            });
        } else {
            post.likes.push(req.user._id);
            await post.save();
            return res.status(200).json({
                status: "success",
                message: "Post liked",
                data: {
                    post,
                },
            });
        }
    } catch (err) {
        console.log(err);
        res.json({
            status: "error",
            message: err.message,
        });
    }
};
exports.followingPosts = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const posts = await Post.find({
            owner: {
                $in: user.following,
            },
        });
        res.status(200).json({
            status: "Success",
            posts,
        });
    } catch (err) {
        console.log(err);
        res.json({
            status: "error",
            message: err.message,
        });
    }
};
exports.updateCaption = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                status: "error",
                message: "Post not found",
            });
        }
        if (post.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                status: "error",
                message: "You are not authorized to update this post",
            });
        }
        post.caption = req.body.caption;
        await post.save();
        res.status(200).json({
            status: "success",
            post,
        });
    } catch (err) {
        res.json({
            status: "error",
            message: err.message,
        });
    }
};
exports.addComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                status: "error",
                message: "Post not found",
            });
        }
        const newComment = {
            comment: req.body.comment,
            user: req.user._id,
        };
        post.comments.push(newComment);
        await post.save();
        res.status(200).json({
            status: "success",
            post,
        });
    } catch (err) {
        res.json({
            status: "error",
            message: err.message,
        });
    }
};
exports.updateComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                status: "error",
                message: "Post not found",
            });
        }
        const comment = post.comments.find(
            (comment) => comment._id.toString() === req.params.commentId
        );

        if (!comment) {
            return res.status(404).json({
                status: "error",
                message: "Comment not found",
            });
        }
        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                status: "error",
                message: "You are not authorized to update this comment",
            });
        }
        comment.comment = req.body.comment;

        await post.save();
        res.status(200).json({
            status: "success",
            post,
        });
    } catch (err) {
        res.json({
            status: "error",
            message: err.message,
        });
    }
};
exports.deleteComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                status: "error",
                message: "Post not found",
            });
        }
        const comment = post.comments.find(
            (comment) => comment._id.toString() === req.params.commentId
        );
        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                status: "error",
                message: "You are not authorized to delete this comment",
            });
        }
        const index = post.comments.indexOf(comment);
        post.comments.splice(index, 1);

        await post.save();
        res.status(200).json({
            status: "success",
            post,
        });
    } catch (err) {
        res.json({
            status: "error",
            message: err.message,
        });
    }
};

//get logged in user post
exports.userPosts = async (req, res) => {
    try {
        const posts = await Post.find({
            owner: req.user._id,
        });
        res.status(200).json({
            status: "success",
            posts,
        });
    } catch (err) {
        res.json({
            status: "error",
            message: err.message,
        });
    }
};

//get all posts
exports.allPosts = async (req, res) => {
    try {
        const posts = await Post.find({}).populate("owner");
        res.status(200).json({
            status: "success",
            posts,
        });
    } catch (err) {
        res.json({
            status: "error",
            message: err.message,
        });
    }
};

//get single post
exports.singlePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate("owner");
        if (!post) {
            return res.status(404).json({
                status: "error",
                message: "Post not found",
            });
        }
        res.status(200).json({
            status: "success",
            post,
        });
    } catch (err) {
        res.json({
            status: "error",
            message: err.message,
        });
    }
};

//get logged in user single post
exports.userPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                status: "error",
                message: "Post not found",
            });
        }
        if (post.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                status: "error",
                message: "You are not authorized to view this post",
            });
        }
        res.status(200).json({
            status: "success",
            post,
        });
    } catch (err) {
        res.json({
            status: "error",
            message: err.message,
        });
    }
};

//get all posts of except logged in user
exports.allPostsExceptUser = async (req, res) => {
    try {
        const posts = await Post.find({
            owner: {
                $ne: req.user._id,
            },
        });
        res.status(200).json({
            status: "success",
            posts,
        });
    } catch (err) {
        res.json({
            status: "error",
            message: err.message,
        });
    }
};
