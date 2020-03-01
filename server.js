const express = require('express');
const mongoose = require('mongoose');
const app = express();
const db = require("./config/db").db;
const profile = require("./routes/api/profile");
const user = require("./routes/api/user");
const post = require("./routes/api/post");
let bodyP = require("body-parser");
const passport = require('passport');

const port = process.env.PORT || 5000;

mongoose.connect(db).then(()=>{
    console.log("Connected to DB")
}).catch((err)=>{
    console.log('Failed to connect to DB '+err)
})

app.use(bodyP.urlencoded({extended :false}));
app.use(bodyP.json());


app.use(passport.initialize());
require('./config/passport')(passport);


app.get('/',(req, res)=>{
res.send("Hello World");
});

app.use('/api/user', user);
app.use('/api/profile', profile);
app.use('/api/post', post);


app.listen(port,()=>{
    console.log(`Server running on ${port}`)
});