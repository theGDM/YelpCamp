const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxRoken = process.env.Mapbox_Token;
const geoCoder = mbxGeocoding({ accessToken: mapBoxRoken });
//now this geocoder will have two methods forwardgeocoding and backwardgeocoding
const { Cloudinary, cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res) => {
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send()
    //console.log(geoData.body.features[0].geometry.coordinates);
    //res.send(geoData.body.features[0].geometry);
    // //const { title, location, description, price } = req.body;
    // //console.log({ ti:title, loca:location });
    // //{ ti: 'Happy Birthday Panda t-shirt', loca: 'india'}
    const campground = new Campground(req.body); //as images will not be in the req.body
    if (!geoData.body) {
        req.flash("error", "Location is incorrect, Please enter valid place .");
        res.redirect("/campgrounds/new");
    }
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "Successfully created new Campground!")
    res.redirect(`/campgrounds/${campground._id}`);
    // //So we have got two layers now, we have got validation on the client side so that you can't submit empty form, you cant be missing
    // //location, title and so on, and here we have validation on server side, in case you make it past, we have got this second layer
    // //that says no no, those things are required. Those fields have to be on body.
};

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const { title, location, price, description} = req.body;
    const updatedCampground = await Campground.findByIdAndUpdate(id, { title, location, price, description }, { runValidators: true, new: true });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    updatedCampground.images.push(...imgs);
    await updatedCampground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await updatedCampground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
        console.log(updatedCampground);
    }
    //Here we are going to use pull operator, so thatshow we pull element out of an array and we want to pull out of the images array.
    //and then we want to pull out of the images array where the filename on each image is not exactly equall to something, but doller
    //sign in, req.body,deleteImages.
    req.flash("success", "Successfully updated the Campground!")
    res.redirect(`/campgrounds/${updatedCampground._id}`);
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const findCampEdit = await Campground.findById(id);
    if (!findCampEdit) {
        req.flash("error", "Cannot find the Campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground: findCampEdit });
};

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findOne({ _id: id }).populate({
        path: "reviews",
        populate: {
            path: "author"
        }
    }).populate("author");
    //console.log(campground);
    //so it is a nested populate, we want populate all the reviews from reviews array, then populate each one of them thier author. 
    if (!campground) {
        req.flash("error", "Cannot find the Campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campFind: campground });
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted Campground!")
    res.redirect("/campgrounds");
};