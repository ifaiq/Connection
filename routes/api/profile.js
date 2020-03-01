const express = require("express");
const router = express.Router();
let Users = require('../../models/Users');
let bcrypt = require("bcryptjs");
var gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const keys = require('../../config/db');
const passport = require('passport');
const Profile = require("../../models/Profile");
const experience = require("../../validation/experience");
const education = require("../../validation/education");
const validateProfileInput = require('../../validation/profile');





router.get('/test', (req, res) => {
    res.json({
        msg: "profile works"
    })
});



router.get('/', passport.authenticate('jwt', {
    session: false
}), (req, res) => {

    Profile.findOne({
        user: req.user.id
    }).then(user => {
        if (!user) {
            return res.status(404).json({
                msg: 'there is no profile for this user'
            })

        }
        res.json(user)
    }).catch(err => {
        res.json(err);
    })


});





router.get('/all', (req, res) => {

    Profile.find()
        .populate('user', ['name', 'avatar'])
        .then(profiles => {
            if (!profiles) {
                return res.status(404).json({
                    msg: 'there is no profile for this user'
                });
            }

            res.json(profiles);
        })
        .catch(err => res.status(404).json({
            profile: 'There are no profiles'
        }));
});

// @route   GET api/profile/handle/:handle
// @desc    Get profile by handle
// @access  Public

router.get('/handle/:handle', (req, res) => {

    Profile.findOne({
            handle: req.params.handle
        })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                res.status(404).json({
                    msg: 'there is no profile for this user'
                });
            }

            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public

router.get('/user/:user_id', (req, res) => {

    Profile.findOne({
            user: req.params.user_id
        })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                res.status(404).json({
                    msg: 'there is no profile for this user'
                });
            }

            res.json(profile);
        })
        .catch(err =>
            res.status(404).json({
                profile: 'There is no profile for this user'
            })
        );
});













router.post('/', passport.authenticate('jwt', {
    session: false
}), (req, res) => {


    const { errors, isValid } = validateProfileInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }


    const profileFields = [];

    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.git)
        profileFields.git = req.body.git;
    // Skills - Spilt into array
    if (typeof req.body.skills !== 'undefined') {
        profileFields.skills = req.body.skills.split(',');
    }

    // Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.insta) profileFields.social.insta = req.body.insta;

    Profile.findOne({
        user: req.user.id
    }).then(user => {

        if (user) {
            Profile.findOneAndUpdate({
                user: req.user.id
            }, {
                $set: profileFields
            }, {
                new: true
            }).then(pro => {
                res.json(pro);
            })
        } else {
            Profile.findOne({
                handle: profileFields.handle
            }).then(hand => {
                if (hand) {
                    res.json({
                        msg: "That handle already exist"
                    });
                }
            })
        }


        new Profile(profileFields).save().then(profile => {
            res.json(profile);
        })
    })


});









router.post('/experience', passport.authenticate('jwt', {
    session: false
}), (req, res) => {

    const {
        errors,
        isValid
    } = experience(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    Profile.findOne({
            user: req.user.id
        })
        .then(pro => {
            const exp = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description,



            }

            pro.experience.unshift(exp);
            pro.save().then(profile => res.json(profile))

        })






})




router.post('/education', passport.authenticate('jwt', {
    session: false
}), (req, res) => {

    const {
        errors,
        isValid
    } = education(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    Profile.findOne({
            user: req.user.id
        })
        .then(profile => {
            const edu = {
                school: req.body.school,
                degree: req.body.degree,
                location: req.body.location,
                field: req.body.field,

                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description



            }

            profile.education.unshift(edu);
            profile.save().then(pro => res.json(pro))

        })






});











// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete(
    '/experience/:exp_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
      Profile.findOne({ user: req.user.id })
        .then(profile => {
          // Get remove index
          const removeIndex = profile.experience
            .map(item => item.id)
            .indexOf(req.params.exp_id);
  
          // Splice out of array
          profile.experience.splice(removeIndex, 1);
  
          // Save
          profile.save().then(profile => res.json(profile));
        })
        .catch(err => res.status(404).json(err));
    }
  );
  
  // @route   DELETE api/profile/education/:edu_id
  // @desc    Delete education from profile
  // @access  Private
  router.delete(
    '/education/:edu_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
      Profile.findOne({ user: req.user.id })
        .then(profile => {
          // Get remove index
          const removeIndex = profile.education
            .map(item => item.id)
            .indexOf(req.params.edu_id);
  
          // Splice out of array
          profile.education.splice(removeIndex, 1);
  
          // Save
          profile.save().then(profile => res.json(profile));
        })
        .catch(err => res.status(404).json(err));
    }
  );
  
  // @route   DELETE api/profile
  // @desc    Delete user and profile
  // @access  Private
  router.delete(
    '/',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
      Profile.findOneAndRemove({ user: req.user.id }).then(() => {
        User.findOneAndRemove({ _id: req.user.id }).then(() =>
          res.json({ success: true })
        );
      });
    }
  );
  





module.exports = router;