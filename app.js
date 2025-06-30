const express =require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const initdata = require("./init/data.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");




const MONGO_URL ="mongodb://127.0.0.1:27017/wanderlust";

main()
 .then(() => {
    console.log("connected to db");
})
 .catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.engine('ejs', ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));

app.use((req, res, next) => {
    console.log("[REQUEST URL]", req.method, req.url);
    next();
});



app.get("/",(req,res) => {
    res.send("hi i am root");
});

//Index Route
app.get("/listings", wrapAsync(async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
})
);

//New Route
app.get("/listings/new", (req,res) =>{
    res.render("listings/new.ejs");
});


//SHOW ROUTE
app.get("/listings/:id",wrapAsync(async (req,res) =>{
    let{id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{ listing });
})
);

//Create Route
app.post("/listings", wrapAsync(async (req,res) => {
    if(!req.body.listing){
        throw new ExpressError(400,"Send valid data for listing");
    }
    const newListing = new Listing(req.body.listingobj);
    await newListing.save();
    res.redirect("/listings")
})
);

//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req,res) => {
    if(!req.body.listing){
        throw new ExpressError(400,"Send valid data for listing");
    }
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
})
);

//Update Route
app.put("/listings/:id", wrapAsync(async (req,res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect("/listings");
})
);

//Delete Route
app.delete("/listings/:id", wrapAsync(async (req,res) =>{
    const { id } = req.params;
    let listing=await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
})
);

/*app.get("/testListing", async (req,res) => {
    let sampleListing = new Listing({
        title: "My New Villa",
        description: "By the beach",
        price: 1200,
        location: "Calangute, Goa",
        country: "India",
    });
    
    await sampleListing.save();
    console.log("sample was saved");
    res.send("successful testing");
});
*/
app.use((req,res,next) => {
    next(new ExpressError(404,"Page not found"));
});

app.use((err,req,res,next) => {
    let{statusCode=500,message="something went wrong"}=err;
    res.status(statuscode).render("error.ejs",{message});
   // res.status(statusCode).send(message);
})

app.listen(8080,() =>{
    console.log("server is listening");
});