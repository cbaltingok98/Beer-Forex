const express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    expressSanitizer = require('express-sanitizer'),
    mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    User = require("./models/user");


    

// APP CONFIG
mongoose.connect('mongodb://localhost/central_ankara', { useNewUrlParser: true });
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
app.use(bodyParser.urlencoded({ extended: true }));;
app.use(expressSanitizer());
app.set("view engine", "ejs");
// app.set("view engine", "ejs");
//app.use(express.static("public"));
app.use(express.static(__dirname + "/public"));
// app.use(bodyParser.urlencoded({ extended: true }));;
app.use(methodOverride("_method"));

//---- PASSPORT CONFIGURATION ----
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//RESTFUL ROUTES

app.get("/", function (req, res) {
    res.redirect("/beers");
});
//INDEX ROUTE
app.get("/beers", function (req, res) {
    Beer.find({}, function (err, beers) {
        if (err) {
            console.log("Error!");
        } else {
            res.render("index", { beers: beers });
        }
    });
});

//NEW ROUTE
app.get("/beers/new", isLoggedIn, function (req, res) {
    res.render("new");
});

app.get("/priceList", function (req, res) {
    Beer.find({}, function (err, beers) {
        if(err) {
            console.log("Error!");
        } else {
            res.render("userFacingList", { beers: beers });
        }
    });
});

//CREATE ROUTE
app.post("/beers", function (req, res) {
    req.body.beer.body = req.sanitize(req.body.beer.body);
    Beer.create(req.body.beer, function (err, newBlog) {
        if (err) {
            res.render("new");
        } else {
            res.redirect("/beers");
        }
    });
});

//SHOW ROUTE
app.get("/beers/:id", function (req, res) {
    Beer.findById(req.params.id, function (err, foundBeer) {
        if (err) {
            res.redirect("/beers");
        } else {
            res.render("show", { beer: foundBeer });
        }
    });
});

//EDIT ROUTE
app.get("/beers/:id/edit", isLoggedIn, function (req, res) {
    Beer.findById(req.params.id, function (err, foundBeer) {
        if (err) {
            res.redirect("/beers");
        } else {
            res.render("edit", { beer: foundBeer });
        }
    });
});

//UPDATE ROUTE
app.put("/beers/:id", function (req, res) {
    req.body.beer.body = req.sanitize(req.body.beer.body);
    Beer.findByIdAndUpdate(req.params.id, req.body.beer, function (err, updatedBeer) {
        if (err) {
            res.redirect("/beers");
        } else {
            res.redirect("/beers/" + req.params.id);
        }
    });
});

app.put("/beers/addPrice/:id", isLoggedIn, function (req, res) {
    Beer.findById(req.params.id, function(err, foundBeer){
        let newPrice = foundBeer.currentPrice;
        newPrice += 0.5;
        Beer.updateOne(foundBeer, { currentPrice: newPrice }, function(err){
            if(err){
                console.log("Fiyat Arttirma Sorunu");
            } else {
                res.redirect("/beers");
            }
        })

    });
});

app.put("/beers/subtractPrice/:id", isLoggedIn, function (req, res) {
    Beer.findById(req.params.id, function(err, foundBeer){
        let newPrice = foundBeer.currentPrice;
        newPrice -= 0.5;
        Beer.updateOne(foundBeer, { currentPrice: newPrice }, function(err){
            if(err){
                console.log("Fiyat Azaltma Sorunu");
            } else {
                res.redirect("/beers");
            }
        })

    });
});

//DELETE ROUTE
app.delete("/beers/:id", isLoggedIn, function (req, res) {
    Beer.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect("/beers");
        } else {
            res.redirect("/beers");
        }
    });
});

//REGISTER ROUTE
app.get("/register", function(req, res){
    res.render("register");
});
// Handle Sign Up Logic
app.post("/register", function(req, res){
    let newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/beers");
        })
    });
});

// Show Login Form
app.get("/login", function(req, res){
    res.render("login");
});
// Handling Login Logic
app.post("/login", passport.authenticate("local",
    {
        successRedirect: "/beers",
        failureRedirect: "/login"
    }), function(req, res){       
});
// LOGOUT LOGIC
app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/beers");
})
//----
//middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(3000, '127.0.0.1', function () {
    console.log("Central Ankara Bira Fiyat Listesi Aktif Edildi");
});
