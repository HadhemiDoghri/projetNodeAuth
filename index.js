var port = 3000
require('dotenv').config()
const express = require('express')
const mongoose = require("mongoose")
const passport = require("passport")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require('method-override')
const User = require("./models/User")
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: false});

const app = express()

mongoose.connect("mongodb://localhost:27017/auth",{
    useUnifiedTopology: true,
    useNewUrlParser: true,
},console.log("connected"))


const initilizePassport = require('./passport-config')
const bcrypt = require('bcryptjs')
const {
    checkNotAuthentificated,
    checkAuthentificated,
}= require('./middlewares/auth')
const { name } = require('ejs')

initilizePassport(
    passport,
    async(email)=>{
        const userFound = await User.findOne({ email })
        return userFound
    },
    async (id) =>{
        const userFound = await User.findOne({_id: id})
        return userFound
    }
)

app.set('view engine','ejs')
app.use(express.urlencoded({extended:true}));
/*app.use(express.static("public"))*/
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
   })
)
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_methode'))

app.listen(port,()=>{
    console.log('server is listening on port: '+port)
})

app.get('/authentification',checkNotAuthentificated,(req,res)=>{
    res.render('authentification')
})
app.get('/inscription',checkNotAuthentificated,(req,res)=>{
    res.render('inscription')
})
app.get('/',checkAuthentificated,(req,res)=>{
    res.render('acceuil',{name: req.user.name})
})

app.post('/authentification',checkNotAuthentificated,passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect: '/authentification',
    failureFlash: true,
  }, 

  )
)

app.get('/logout',(req,res)=>{
    res.render('authentification')
})

app.post('/logout',(req,res)=>{
    res.render('authentification')
})

app.delete('/logout',(req, res) => {
    req.logOut()
    res.redirect('/authentification')
})


app.post('/inscription', checkNotAuthentificated, async (req, res) => {
    const userFound = await User.findOne({email: req.body.email})
    console.log('jjjhh')
    if(userFound){
        req.flash('error', 'user with tha email already exists')
        res.redirect('/inscription')
    }
    else{
        try {
            const hashedPassword = await bcrypt.hash(req.body.password,10)
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword
            } )
            await user.save()
            res.redirect('/authentification')
        } catch (error) {
            console.log('error')
            res.redirect('/inscription')
        }
    }
})

app.get('/suppression',(req,res)=>{
    res.render('suppression')
})


app.post('/suppression', urlencodedParser, (req, res) => {
    res.json(req.body);
    username = req.body['username'];

    User.remove({ name : username }, function (err) {
        if (err) { throw err; }
        console.log("Utilisateur "+ username +" a été supprimé !");
    });
});

app.get('/recherche',(req,res)=>{
    res.render('recherche')
})

app.post('/recherche', urlencodedParser, (req, res) => {
    res.json(req.body);
    email = req.body['username'];
    nom = req.body['name']

    User.find({ username : email}, function (err, users) {
        if (err) { throw err; }
        console.log(users);
    });
});

app.get('/modification',(req,res)=>{
    res.render('modification')
})


app.post('/modification', urlencodedParser, (req, res) => {
    res.json(req.body);
    email = req.body['username'];
    emailN = req.body['usernameN'];

    User.update({ username : email}, { username :  emailN }, { multi : true }, function (err) {
        if (err) { throw err; }
        console.log('user :'+email+' a été modifié !');
    });
});


