require('dotenv').config();
const express = require('express');
const path = require('path');
const passport = require('passport');
const { Strategy } = require('passport-google-oauth20');
const cookieSession = require('cookie-session');
const helmet = require('helmet');
const morgan = require('morgan');
const userModel = require('./models/users.model');
const chatsModel = require('./models/chats.model');

const config = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    COOKIE_KEY_1: process.env.COOKIE_KEY_1,
    COOKIE_KEY_2: process.env.COOKIE_KEY_2
};

const AUTH_OPTIONS = {
    callbackURL: process.env.oAuthCallback_deployed,
    clientID: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET
};

function verifyCallback(accessToken, refreshToken, profile, done) {
    console.log('Google Profile', profile._json, "\nProvided by ", profile.provider);
    return done(null, profile);
}

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));

// Saving the session to cookie
passport.serializeUser((user, done) => {
    done(null, user._json);
});

// Reading session from cookie
passport.deserializeUser((obj, done) => {
    done(null, obj);
});

const app = express();

app.use(morgan('dev'));
app.use(helmet());

app.use((req, res, next) => {
    const csp = {
        'default-src': 'none'
    };

    const cspString = Object.entries(csp).map(([k, v]) => `${k} ${v}`).join('; ');
    res.setHeader('Content-Security-Policy', cspString);
    next();
});

app.use(cookieSession({
    name: 'session',
    maxAge: 24 * 60 * 60 * 1000,
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2],
    httpOnly: true
}));

app.use(passport.initialize());
app.use(passport.session());

function checkLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            error: 'You must log in!'
        });
    }
    console.log('Current user is: ', req.user.name);
    next();
}

app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['email', 'profile']
    })
);

app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/failure',
        successRedirect: '/chat',
        session: true
    }),
    (req, res) => {
        console.log("Google called us back");
    }
);

app.get('/auth/logout', (req, res) => {
    console.log('Logging out');
    req.logout(() => {
        res.redirect('/');
    });
});

app.get('/failure', (req, res) => {
    res.send("Something Went Wrong");
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "..", "Chatroom_client", "index.html"));
});

app.use(express.static(
    path.join(__dirname, '..', 'Chatroom_client')
));

app.get('/history', async (req, res) => {
    console.log('History endpoint');
    const chatHistory = await chatsModel.find({});
    res.json(chatHistory);
    console.log("Chat history served");
});

app.get('/chat', checkLoggedIn, (req, res) => {
    console.log('Serving Home Page');
    res.sendFile(path.join(__dirname, "..", "Chatroom_client", "index.html"));
});

module.exports = app;
