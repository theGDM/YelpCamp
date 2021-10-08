const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchAsync");
const campgrounds = require("../controllers/campground");//so now we have this campground object that represents campground controllers. It just have a bunch of methods on it.
const { isAuthor, validateCampground, isLoggedIn } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage});

router.route("/")
    .get(catchAsync(campgrounds.index))//these are controllers methods, .index, .rederNewForm
    .post(isLoggedIn,upload.array("image"),validateCampground, catchAsync(campgrounds.createCampground));
    
router.get("/new", isLoggedIn, campgrounds.renderNewForm);    

router.route("/:id")
    .put(isLoggedIn, isAuthor,upload.array("image"), validateCampground, catchAsync(campgrounds.updateCampground))
    .get(catchAsync(campgrounds.showCampground))
    .delete(isLoggedIn,isAuthor,catchAsync(campgrounds.deleteCampground));

router.get("/:id/edit",isLoggedIn,isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;
