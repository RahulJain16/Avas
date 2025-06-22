const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema(
    {
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        filename : String,
       url:{
         type: String,
        default: "https://unsplash.com/photos/a-view-of-the-sky-from-above-the-clouds-8xXeYkZMm-c", 
        set: (v) => v ==="" ? "https://unsplash.com/photos/a-view-of-the-sky-from-above-the-clouds-8xXeYkZMm-c" : v,
    }
},
    price: Number,
    location: String,
    country: String,
});
  
 
 
const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;