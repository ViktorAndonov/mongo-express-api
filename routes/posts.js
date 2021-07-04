const express = require('express');
const router = express.Router();
// we need to import our model
const Post = require('../models/Post');
const verify = require('../verifyToken');

// Gets all the posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find();
        res.json(posts);
    } catch (err) {
        res.json({ message: err });
    }
});

// Gets specific post
router.get('/:postId', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        res.json(post);
    } catch(err) {
        res.json({ message:err });
    }
});

// Creates a post (uses custom middleware "verify" to verify JWT token)
router.post('/', verify, async (req, res) => {
    const reqPost = new Post({
        title: req.body.title,
        description: req.body.description
    });

    try {
        const savedPost = await reqPost.save();
        res.json(savedPost);
        // we also have access to the user object from verify
        // res.send(req.user);
    } catch (err) {
        res.json({ message: err });
    }
});

// Deletes specific post
router.delete('/:postId', async (req, res) => {
    try {
        const deletePost = await Post.remove({
            _id: req.params.postId
        });
        res.json(deletePost);
    } catch (err) {
        res.json({ message: err });
    }
});

// Updates specific post
router.patch('/:postId', async (req, res) => {
    try {
        const updatePost = await Post.updateOne({ 
            _id: req.params.postId 
        }, { 
            $set: { 
                title: req.body.title,
            } 
        });
        res.json(updatePost);
    } catch (err) {
        res.json({ message: err });
    }
});

module.exports = router;