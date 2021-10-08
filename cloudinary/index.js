const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.Cloudinary_CLOUD_Name,
    api_key: process.env.Cloudinary_Key,
    api_secret: process.env.Cloudinary_Secret
});


//so now we are basically just setting up an instance of cloudinary in this file
const storage = new CloudinaryStorage({
    cloudinary, //cloudinary object that we just configured
    params: {
        folder: "YelpCamp",
        allowedFormats: ["jpeg", "png", "jpg"]
    }
});

//Now i am just going to export both our cloudinary instance that is configured, and storage, which is what we made here.
module.exports = {
    cloudinary,
    storage
}