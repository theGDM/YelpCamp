if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ExpressError = require("./utilities/ExpressError")
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const campgroundRoutes = require("./routes/campground");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const MongoStore = require('connect-mongo');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yep-camp';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
    .then(() => {
        console.log("MONGO CONNECTION OPEN!");
    })
    .catch((e) => {
        console.log("OH NO MONGO ERROR!");
        console.log(e);
    }) 

app.engine("ejs", ejsMate);//ejs-mate is just one of many engines that are used to run or parse and basically sense of ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const secret = process.env.SECRET || "yelpcamp";

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60, // time period in seconds
    crypto: {
        secret
    }
});

store.on("error", function (e) {
    console.log("session store error", e);
})

const sessionConfig = {
    store:store,
    name: "_yOyO",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,// this basically says that cookies are only accessible over HTTP, they are not accessible through js.
        // secure:true, //this will break stuff untill you make the site https but it will break stuff with local host since localhost is not https.
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge:7 * 24 * 60 * 60 * 1000
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());
//this automatically enables all the 11 middleware, that helmet comes with.

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://api.mapbox.com/mapbox-gl-js/v2.4.1/mapbox-gl.js.map",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.3/dist/umd/popper.min.js",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/js/bootstrap.min.js"
    
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.mapbox.com/mapbox-gl-js/v2.4.1/mapbox-gl.js.map",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://api.mapbox.com/mapbox-gl-js/v2.4.1/mapbox-gl.js.map",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/",
                "https://res.cloudinary.com/douqbebwk/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//These has to do how the information is stored and retrieve in the session and from the session.

app.use(mongoSanitize({
    replaceWith: '_',
}));

app.use((req, res, next) => {
    if (!["/", "/login"].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;
    }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})
//on every single request, i'm putting it before our route handlers, so on every single request, we are going to take whatever is in
//the flash under "success" and have access to it in our locals under, the key success.
//res.locals.success and error are the global things, i mean but they are called locals, but i have access to them in every single,
//template.So now in my templates, all templates, i should have access to current user.

app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/", userRoutes);
 
app.get("/", (req, res) => {
    res.render("campgrounds/home");
})

//remember this will only run if nothing else has matched first and we didn't respond for many of them, and the order is very very imporatant,
//this could be get or post.
app.all("*", (req, res, next) => {//* means for every path //all means for any verb
    next(new ExpressError("Page not found!", 404));
})

//error-handling function middleware
app.use((err, req, res, next) => {
    const { statusCode=500, message="Something went wrong!!" } = err;
    res.status(statusCode).render("error",{s:statusCode, m:message ,es:err.stack});
})

//so if i go to some route that doesn't exists and we get page not found!!, Now if i go to some other page that causes an error, like
//some id that doesn't exist we will get this error (Cast to ObjectId failed for value "6138f22583610221gc1b745c" (type string) at path "_id" for model "Campground")

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Serving on port ${port}`);
})