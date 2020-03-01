const express = require("express");
const router = express.Router();
let Users = require('../../models/Users');
let bcrypt = require("bcryptjs");
var gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const keys = require('../../config/db');
const passport = require('passport');

const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

router.get('/test', (req, res) => {
    res.json({
        msg: "user works"
    })
});


router.post('/register', (req, res) => {

    const {
        errors,
        isValid
    } = validateRegisterInput(req.body);

    // Check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }


    Users.findOne({
        email: req.body.email
    }).then(user => {
        if (user) {
            errors.email = 'Email already exists';
            return res.status(400).json(errors);

        } else {

            avatar = gravatar.url(req.body.email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            })
            let user = new Users({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                avatar
            })


            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(user.password, salt, (err, hash) => {
                    if (err) throw err;
                    user.password = hash;
                    user.save().then(user => {
                        res.json(user)
                    }).catch((err) => {
                        console.log(err);
                    })
                })

            })
        }



    }).catch((err) => {
        console.log(err)
    })
})






router.post('/login', (req, res) => {

    const email = req.body.email;
    const password = req.body.password;
    const {
        errors,
        isValid
    } = validateLoginInput(req.body);

    // Check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }
    Users.findOne({
        email
    }).then(user => {

        if (!user) {
            errors.email = 'User not found';
            return res.status(404).json(errors);
        }

        bcrypt.compare(password, user.password).then(match => {
            if (match) {

                const payload = {
                    id: user.id,
                    name: user.name,
                    avatar: user.avatar
                }
                jwt.sign(payload, keys.keys, {
                        expiresIn: 3600
                    },
                    (err, token) => {
                        if (err) {
                            res.status(400).json({
                                err
                            })
                        } else {
                            res.json({
                                success: true,
                                token: token
                            })
                        }
                    })


            } else {
                errors.password = 'Password incorrect';
                return res.status(400).json(errors);
            }
        })


    })

});





router.get('/current', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    res.json(req.user)


});


module.exports = router;