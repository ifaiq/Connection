const express = require("express");
const passport = require('passport');
const Post = require("../../models/Post");
const validatePost = require('../../validation/post')
const Profile = require("../../models/Profile");
const router = express.Router();


router.get('/test', (req, res) => {
    res.json({ msg: "post works" })
});


router.get('/', (req, res) => {

    Post.find().sort({ date: -1 }).then(post => res.json(post))
        .catch(err => {
            res.status(404).json({ nopostfound: "No Post Found" })
        })

});





router.get('/:id', (req, res) => {

    Post.findById(req.params.id).then(post => res.json(post))
        .catch(err => {
            res.status(404).json({ nopostfound: "No Post Found" })
        })

});





router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validatePost(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id



    });

    newPost.save().then(post => res.json(post));



})






router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Profile.findOne({ user: req.user.id }).then((profile) => {

        if (profile.user.toString() !== req.user.id) {

            return res.status(401).json({ notauthorized: "Not found" })
        }

        profile.remove().then(() => {
            res.json({ success: "true" })
        }).catch(err => {

            res.status(404).json({ nopostfound: "not found" })

        });
    });
});









router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Profile.findOne({ user: req.user.id }).then((profile) => {
        Post.findById(req.params.id).then(post => {
            if (post.likes.filter(like =>
                like.user.toString() === req.user.id).length > 0) {


                return res.status(400).json({ alreadyliked: "liked already" })
            }

            post.likes.unshift({ user: req.user.id });

            post.save().then(post => { res.json(post) });



        }).catch(err => {
            res.status(404).json({ err: "not found" });
        });

    });
});









router.post('/unlike/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Profile.findOne({ user: req.user.id }).then((profile) => {
        Post.findById(req.params.id).then(post => {
            if (post.likes.filter(like => {
                like.user.toString() === req.user.id
            }).length === 0) {


                return res.status(400).json({ notliked: "liked not" })
            }


            const removeIndex = post.likes
                .map(item => { item.user.toString() }).indexOf(req.user.id)


            post.likes.splice(remove, 1);
            post.save().then(post => { res.json(post) });



        }).catch(err => {
            res.status(404).json({ err: "not found" });
        });

    });
});








router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validatePost(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id }).then((profile) => {
        Post.findById(req.params.id).then(post => {

            const comment = {
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar,
                user: req.user.id


            }


            post.comments.unshift(comment);

            post.save().then(post => { res.json(post) });



        }).catch(err => {
            res.status(404).json({ err: "not found" });
        });

    });
});









router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Profile.findOne({ user: req.user.id }).then((profile) => {
        Post.findById(req.params.id).then(post => {

            if (post.comments.filter(filter => filter.comment_id.toString() === req.params.comment_id).length === 0)
            {return res.status(400).json({notexsist:"not exsist"})}

            const removeIndex = post.comments
            .map(item=>item._id.toString()).indexOf(req.params.comment_id);

            post.comment.splice(removeIndex,1);

                post.save().then(post => { res.json(post) });



        }).catch(err => {
            res.status(404).json({ err: "not found" });
        });

    });
});







module.exports = router;