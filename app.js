require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const app = express();

const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}))

// 1. -------------initialising passport  for session ------------
app.use(session({
    secret: 'Adenozyno-trifosforanWapnia',
    resave: false,
    saveUninitialized: false
}));
// 2. initialize passport
app.use(passport.initialize())
// 3. use passport to manage sessions
app.use(passport.session())

mongoose.connect('mongodb://localhost:27017/usersDB', {useNewUrlParser: true})
// 4. mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})
//5. userSchema set to use plugin witch handels below
//5. -------- Hash and Salt passwords, saves user to database ---------
userSchema.plugin(passportLocalMongoose)


// ------------- encrypting DB ----------------

const User = new mongoose.model('User', userSchema, 'users')

//6. passport  local mongoose creates a local LOGIN strategy
passport.use(User.createStrategy());

//7. Passport set to serialize and deserialize USER - storing user information in session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/secrets', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('secrets');
    } else {
        res.redirect('/login')
    }


})

// --------------------- login -------------------------
app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/login', (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })
    // login from passport authenticate user that is trying to login
    req.login(user, function (err) {
        if (err){
            console.log(err)
        }else{
            passport.authenticate('local')
            res.redirect('/secrets')
        }
    })
});

// -------------------- register ------------------
app.get('/register', (req, res) => {
    res.render('register');
})


app.post('/register', (req, res) => {
    User.register({username: req.body.username}, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect('/register');
        } else {
            passport.authenticate('local')(req, res, function () {
                res.redirect('/secrets');
            })
        }
    });

});

app.get('/logout', (req, res)=>{
    req.logout((err)=>console.log(err));
    res.redirect('/');
})


app.listen(3000, () => {
    console.log('Server is running on port 3000')
})