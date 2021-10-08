const mongoose = require("mongoose");
const Campground = require("../models/campground") //one step back and look at the models directory when executing seeds/index.js
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");

mongoose.connect('mongodb://localhost:27017/yep-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log("MONGO CONNECTION OPEN!");
    })
    .catch((e) => {
        console.log("OH NO MONGO ERROR!");
        console.log(e);
    })

const sample = array => {
  return array[Math.floor(Math.random() * array.length)];
}

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 150; ++i) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author:"614c8cc201c6c90b5ca78b36",
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            images:[
                  {
                     url: 'https://res.cloudinary.com/gdm-projects/image/upload/v1632737714/YelpCamp/ddnnvxisqvnoi04ct5h1.jpg',
                     filename: 'YelpCamp/ddnnvxisqvnoi04ct5h1'
                  },
                  {
                     url: 'https://res.cloudinary.com/gdm-projects/image/upload/v1632737799/YelpCamp/b4pvhhhtwhp2tg1kiiaw.jpg',
                     filename: 'YelpCamp/b4pvhhhtwhp2tg1kiiaw'
                  }
                   ],
            description:"Lorem ipsum dolor, sit amet consectetur adipisicing elit. Delectus, ipsa atque. Fugit recusandae dicta fugiat sint velit ratione unde, nemo corrupti itaque cupiditate magni error rerum quis ipsa qui consectetur Lorem ipsum dolor, sit amet consectetur adipisicing elit. Delectus, ipsa atque. Fugit recusandae dicta fugiat sint velit ratione unde, nemo corrupti itaque cupiditate magni error rerum quis ipsa qui consectetur Lorem ipsum dolor, sit amet consectetur adipisicing elit.",
            geometry: {
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ],
                type: 'Point'
            },
            price: price
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
}) //return promise 