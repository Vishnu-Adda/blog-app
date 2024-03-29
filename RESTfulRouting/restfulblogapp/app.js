var bodyParser   = require("body-parser"), 
expressSanitizer = require("express-sanitizer"),
methodOverride   = require("method-override"),
mongoose         = require("mongoose"),
express          = require("express"),
app              = express();
  
// APP CONFIG  
mongoose.connect("mongodb://localhost/restful_blog_app");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer()); // This must go after body parser
app.use(methodOverride("_method"));

// MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now }
}); 
var Blog = mongoose.model("Blog", blogSchema);

// RESTFUL ROUTES

app.get("/", function(req, res) {
    res.redirect("/blogs"); 
});


//INDEX ROUTE
app.get("/blogs", function(req, res) {
    Blog.find({}, function(err, blogs) {
        if(err) {
            console.log(err);
        } else {
            res.render("index", {blogs: blogs});
        }
    });
});

// NEW ROUTE
app.get("/blogs/new", function(req, res) {
    res.render("new"); 
});

//CREATE ROUTE
app.post("/blogs", function(req, res) {
    // create blog
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog) {
         if(err) {
             res.render("new");
         } else {
             // redirect to the index
             res.redirect("/blogs");
         }
    });
});

// SHOW
app.get("/blogs/:id", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if(err) {
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: foundBlog});
        }
    }); 
});

// EDIT
app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if(err) {
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });
});

// UPDATE
app.put("/blogs/:id", function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body); // Good use case for Middleware
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
        if(err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// DELETE
app.delete("/blogs/:id", function(req, res) {
    // Destroy blog
    Blog.findByIdAndRemove(req.params.id, function(err) {
        // Redirect somewhere
        if(err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
});

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Server has started!"); 
});