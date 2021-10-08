const User = require("../models/user");

module.exports.renderRegisterForm = (req, res) => {
    res.render("users/register");
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registerUser = await User.register(user, password);
        req.login(registerUser, err => { //req.login returns a user object on success or an error on failure.
            if (err) return next(err);
            req.flash("success", "Welcome to the Yelp-Camp!");
            res.redirect("/campgrounds");
        })
        //user.register will take the new user that we just made (the entire instance of a user) and it takes the password and it should hash
        //the password, store the salt and the hash result on our new user.
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/register");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
};

module.exports.login = async (req, res) => {
    req.flash("success", `Welcome Back ${req.user.username}!`);
    const redirectUrl = req.session.returnTo || "/campgrounds";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
    req.flash("success", `Goodbye ${req.user ? req.user.username : ""}!`);
    req.logout();//req.user is null after we logout, so place flash before req.logout
    delete req.session.returnTo;
    res.redirect("/campgrounds");
}; 