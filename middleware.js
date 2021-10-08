const ExpressError = require("./utilities/ExpressError")
const { campgroundSchema,reviewSchema } = require("./schemaValidation");//it will return an object
const Campground = require("./models/campground");
const Review = require("./models/review");

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in first!");
        return res.redirect("/login");
    }
    next();
}
module.exports.isLoggedIn = isLoggedIn;

//so i am going to define a function and i am not going to do app.use , because i don't want to run this on every single route
//i want his to be selectively applied and we have seen how to do that.
const validateCampground = (req, res, next) => {//it's a middleware function
    //now this is not a monggose schema, this is just going to validate our data before we even attempt to save it with mongoose.
    const { error } = campgroundSchema.validate(req.body);
    //console.log(error.details);
    if (error) {
        //result.error.details is an array of objects
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}
module.exports.validateCampground = validateCampground;

const isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/campgrounds/${campground._id}`);
    }
    next();
}
module.exports.isAuthor = isAuthor;

const isReviewAuthor = async (req, res, next) => {
    const { id,reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You are not authorised to do that!");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
module.exports.isReviewAuthor = isReviewAuthor;

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}
module.exports.validateReview = validateReview;

