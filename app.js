require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const app = express();
const encrypt = require('mongoose-encryption');
const md5 = require('md5')


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
    const password = md5(req.body.password)
    console.log(username)
    console.log(password)

    try {
        User.findOne({email: username}).then((user) => {
            if (user && user.password === password) {
                res.render('secrets');
            } else {
                res.render('login')
            }
        })
    } catch(err) {
        res.render('login');
    }
});


// -------------------- register ------------------
app.get('/register', (req, res) => {
    res.render('register');
})


app.post('/register', (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: md5(req.body.password)
    })
    newUser.save().then(() => {
        console.log('New user registered')
        res.render('secrets');
    }).catch(err => console.log(err))
})


app.listen(3000, () => {
    console.log('Server is running on port 3000')
})