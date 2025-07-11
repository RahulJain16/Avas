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
const {listingSchema, reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");




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

const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expire: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.get("/",(req,res) => {
    res.send("hi i am root");
});


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.get("/demouser", async (req,res) => {
    let fakeUser = new User({
        email: "student@gmail.com",
        username: "delta-student"
    });

    let registerUser = await User.register(fakeUser, "helloworld");
    res.send(registerUser);
});

const validateListing = (req,res,next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

const validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

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
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error","listing you requested does not exist");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs",{ listing });
})
);

//Create Route
app.post("/listings", validateListing, wrapAsync(async (req,res) => {
    const newListing = new Listing(req.body.listing);   
    await newListing.save();
    req.flash("success","new listing created");
    res.redirect("/listings")
})
);

//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        throw new ExpressError(400,"Send valid data for listing");
    }
    res.render("listings/edit.ejs",{listing});
})
);

//Update Route
app.put("/listings/:id", validateListing, wrapAsync(async (req,res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash("success","Listing Updated");
    res.redirect("/listings");
})
);

//Delete Route
app.delete("/listings/:id", wrapAsync(async (req,res) => {
    let { id } = req.params;
    let listing=await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted");
    res.redirect("/listings");
})
);



//Reviews
//POST Route
app.post("/listings/:id/reviews", validateReview, wrapAsync (async(req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success","New Review created");
    res.redirect(`/listings/${listing._id}`)
})
);


//Delete Review Route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req,res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted");

    res.redirect(`/listings/${id}`);
})
);


//User signup
app.get("/signup", (req, res) => {
    res.render("users/signup.ejs");

});

app.use((req,res,next) => {
    next(new ExpressError(404,"Page not found"));
});

app.use((err,req,res,next) => {
    let{statusCode=500,message="something went wrong"}=err;
    res.status(statusCode).render("error.ejs",{message});
   // res.status(statusCode).send(message);
})

app.listen(8080,() =>{
    console.log("server is listening");
});