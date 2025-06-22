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
        type: String,
        default: "https://unsplash.com/photos/a-view-of-the-sky-from-above-the-clouds-8xXeYkZMm-c", 
        set: (v) => v ==="" ? "https://unsplash.com/photos/a-view-of-the-sky-from-above-the-clouds-8xXeYkZMm-c" : v,
    },
    price: Number,
    location: String,
    country: String,
},
  {
    title: "Cozy Beachfront Cottage",
    description:
      "Escape to this charming beachfront cottage for a relaxing getaway. Enjoy stunning ocean views and easy access to the beach.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 1500,
    location: "Malibu",
    country: "United States",
  });
 
 
const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;