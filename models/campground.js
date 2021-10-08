const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const imageSchema = new Schema({
    url: String,
    filename:String
})

imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace("/upload", "/upload/w_200");
    //this will refer to the the particular image
})
//So the reason we use a virtual, is that we don't need to store this on our model or in the database because it's just derived from 
//information we are already storing.

const opts = { toJSON: { virtuals: true } };

const campgroundSchema = new Schema({
    title: {
        type: String,
    },
    images: [imageSchema],
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required:true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: {
        type: Number,
    },
    description: {
        type: String,
    },
    location: {
        type: String,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref:"User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref:"Review"
        }
    ]
},opts);

//so to next something under properties i can do like...
//when using this operator use conventional function not arrow function
campgroundSchema.virtual("properties.popUpMarkup").get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0,30)}...</p>`
})
//ok that's all we need to do to register our virtual property, and if i goto my cmpground or index.ejs page rather, and i want
//to access that virtual at some points let's just sy below each title.
//By default Mongoose does not include virtuals when you convert a document to JSON. So to do that you need to include...
//here this refers to the particular campgrounds' instance.
//So we have defined this nice virtual property that it is just going to include some markUp now for that popUp on every 
//single campground

campgroundSchema.post("findOneAndDelete", async function (data) {
    if (data.reviews.length) {
        await Review.deleteMany({
            _id: {
                $in: data.reviews
            }
        })
    }    
})

const Campground = mongoose.model("Campground", campgroundSchema);
module.exports = Campground;
