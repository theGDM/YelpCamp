const express = require("express");
const router = express.Router({ mergeParams: true });
//express router likes to keep params separate, so over there in index.js we are saying there is an ID in the route in the path, that
//prefixes all of these routes. But by default we actually won't have access to that ID in our reviews routes. Router get separate params
//and they are separate, so we can  actually specify an option here, which is mergeParams and set that to true. So all of these params
//int index.js are also going to be merged alongside the params in this file. So now we have access to the ID params over here.

const catchAsync = require("../utilities/catchAsync");
const reviews = require("../controllers/reviews");
const {isLoggedIn,validateReview,isReviewAuthor} = require("../middleware");

router.post("/",isLoggedIn, validateReview, catchAsync(reviews.createReview));
   
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;