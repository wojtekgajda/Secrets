require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const app = express();
const bcrypt = require('bcryptjs')


app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}))

mongoose.connect('mongodb://localhost:27017/usersDB', {useNewUrlParser: true})

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

// ------------- encrypting DB ----------------


const User = new mongoose.model('User', userSchema, 'users')


app.get('/', (req, res) => {
    res.render('home');
})

// --------------------- login -------------------------
app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/login', (req, res) => {
    const username = req.body.username
    const password = req.body.password
    try {
        User.findOne({email: username}).then((user) => {
            bcrypt.compare(password, user.password).then((result) => {
                if (result === true) {
                    res.render('secrets');
                } else {
                    res.render('login')
                }
            })
        });


    } catch (err) {
        res.render('login');
    }
});


// -------------------- register ------------------
app.get('/register', (req, res) => {
    res.render('register');
})


app.post('/register', (req, res) => {

    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(req.body.password, salt, function (err, hash) {
            const newUser = new User({
                email: req.body.username,
                password: hash
            })
            newUser.save().then(() => {
                console.log('New user registered')
                res.render('secrets');
            }).catch(err => console.log(err))
        });
    });
});


app.listen(3000, () => {
    console.log('Server is running on port 3000')
})