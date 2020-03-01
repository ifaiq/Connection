const jwtStrategy = require('passport-jwt').Strategy;
const Extract = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const Users = require("../models/Users")
const keys = require('../config/db');


const opts = {};
opts.jwtFromRequest = Extract.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.keys;

module.exports = passport => {

    passport.use(new jwtStrategy(opts, (jwt_payload, done) => {

        console.log(jwt_payload);
        Users.findById(jwt_payload.id).then(user => {
            if (user) {
                return done(null, user);
            }
            return done(null, false);

        }).catch((err => {
            console.log(err)
        }))

    }));
}