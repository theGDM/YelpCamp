const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utilities/catchAsync");
const users = require("../controllers/users");

router.route("/register")
    .get(users.renderRegisterForm)
    .post(catchAsync(users.register));

router.route("/login")
    .get(users.renderLoginForm)
    .post(passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), users.login);
//for /login we use this passport authenticate.authenticate helper, this just does it all for us as middleware, but we can't authenticate
//someone untill we have created a user, so we have to use this req.login, just another passport quirk.
//The password.authenticate, automatically looks for username and password on the req.body object.

router.get("/logout", users.logout);

module.exports = router;