require('dotenv').config();
const express = require('express');

const path = require('path');
const passport = require('passport');
const {Strategy} = require('passport-google-oauth20');
const cookieSession = require('cookie-session')
const {verify}=require('crypto')

const userModel = require('./models/users.model')

const helmet = require('helmet')



const config = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    COOKIE_KEY_1:process.env.COOKIE_KEY_1,
    COOKIE_KEY_2:process.env.COOKIE_KEY_2
    
}

const AUTH_OPTIONS = {
    callbackURL: process.env.oAuthCallback_deployed,
    clientID: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET
}

function verifyCallback(accessToken, refreshToken,profile,done){
    console.log('Google Profile',profile._json,"\nProvided by ",profile.provider);
    
    return done(null,profile)
}

passport.use(new Strategy(AUTH_OPTIONS,verifyCallback))
//saving the session to cookie
passport.serializeUser((user,done)=>{
    done(null,user._json);
})
//reading session from cookie
passport.deserializeUser((obj,done)=>{
    console.log('Deserializing data: ',obj)
    done(null,obj);
})

const app = express();
app.use(helmet());
const csp = {
    // 'connect-src':["'self'",'https://chatroom-gy71.onrender.com/'],
    'default-src': ["'self'"],
    'script-src': ["'self'", 'https://cdn.socket.io/4.7.2/', 'strict-dynamic'],
    'style-src': ["'self'", 'https://chatroom-gy71.onrender.com/','unsafe-inline'],
    'img-src': ["'self'", 'data:'],
};

app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', Object.entries(csp).map(([k, v]) => `${k} ${v.join(' ')}`).join('; '));
    next();
});
// app.use((req, res, next) => {
    
//     const cookieOptions = {
//         name:'session',
//         maxAge: 24 * 60 * 60 * 1000,
//         keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2], 
//         httpOnly: false
//     };
  
//     res.cookie('session', req.session, cookieOptions);
  
//     next();
// });
const cookieOptions = {
    name:'session',
    maxAge: 24 * 60 * 60 * 1000,
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2], 
    httpOnly: false
};
app.use(cookieSession({
    name:'session',
    maxAge:24*60*60*1000,
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2],
    httpOnly:false
    
}))
app.use(passport.initialize())
app.use(passport.session())

function checkLoggedIn(req,res,next){
    
    const isLoggedIn = req.isAuthenticated();
    const googleUserData = req.user;
    console.log(req.user)
    
    userModel.create({
        sub: googleUserData.sub,
        name: googleUserData.name,
        given_name: googleUserData.given_name,
        family_name: googleUserData.family_name,
        picture: googleUserData.picture,
        email:  googleUserData.email,
        email_verified: googleUserData.email_verified,
        locale: googleUserData.locale
    })  
    

    if(!isLoggedIn){
        return res.status(401).json({
            error:'You must log in!'
        })
    }
    console.log('Current user is: ',req.user.name)
    next();
}


app.get('/auth/google',
    passport.authenticate('google',{
        scope: ['email','profile']
    }),
    (req,res)=>{
        console.log("Data came!.....")
    }
);

app.get('/auth/google/callback', 
    passport.authenticate('google' , {
        failureRedirect: '/failure',
        successRedirect:'/chat',
        session: true,
    }),
    (req,res)=>{
        console.log("Google called us back")
    }
);
app.get('/auth/logout',(req,res)=>{
    console.log('logging out');
    req.logout();
    res.redirect('/');
})

app.get('/failure',(req,res)=>{
    res.send("Something Went Wrong")
})

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,"..","Chatroom_client","landing_page.html"))
})

app.use(express.static(
    path.join(__dirname,'..','Chatroom_client')
));

app.get('/chat',checkLoggedIn,(req,res)=>{
    console.log('Serving Home Page');
    res.sendFile(path.join(__dirname,"..","Chatroom_client","index.html"));
})


module.exports = app;