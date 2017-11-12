var  express           = require("express")
   , app               = express()
   , expressSanitizer  = require("express-sanitizer")
   , methodOverride    = require("method-override")
   , bodyParser        = require("body-parser")
   , mongoose          = require("mongoose");
   
//App config   
mongoose.connect("mongodb://localhost/blogs");
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());

//Mongoose model config
var blogSchema = new mongoose.Schema({
     title       : String,
     image       : String,
     body        : String,
     created     :  {
                       type     : Date,
                       default  : Date.now
                    }
});
var Blog = mongoose.model("Blog",blogSchema);

//Restful routes

//INDEX ROUTE

//redirects to our index route
app.get("/",function(req,res){
    res.redirect("/blogs"); 
});

//index route definition
app.get("/blogs",function(req,res){
         //finding all the blogs from the database and sending it to the ejs template in the object blogs to render.     
            Blog.find({},function(err,blogs){
                 if(err){
                     console.log("Error!!");
                 }
                 else{
                      res.render("index",{blogs:blogs}); 
                 }
            });
});

//NEW ROUTE
app.get("/blogs/new",function(req,res){
    res.render("new");
});

//CREATE ROUTE
app.post("/blogs",function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    //All the information title,image,content and date are parsed into blog[] which is used as an object to create a new blog in the database
      Blog.create(req.body.blog,function(err,newblog){  //newblog will hold the newblog content and it will make a new blog onto the db.
            if(err){
                res.render("new");
            }else{
                res.redirect("/blogs");
            }
      }); 
});

//SHOW ROUTE
app.get("/blogs/:id",function(req,res){
  //searching blog with the particular id given in the request parameters    
    Blog.findById(req.params.id,function(err,foundBlog){  //found blog is parsed into an foundBlog object
           if(err){
               res.redirect("/blogs"); 
           }else{
 //found blog is passed on to the ejs(show) template                 
               res.render("show",{blog:foundBlog});
           } 
    }); 
});

//EDIT ROUTE
app.get("/blogs/:id/edit",function(req,res){
//searching blog with the particular id given in the request parameters    
    Blog.findById(req.params.id,function(err,foundBlog){
           if(err){
               res.redirect("/blogs");
           }else{
//found blog is passed on to the ejs(edit) template
               res.render("edit",{blog:foundBlog});
           }
    })
});

//UPDATE ROUTE
app.put("/blogs/:id",function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,upadtedBlog){
                if(err){
                    res.redirect("/blogs");
                } 
                else{
                    res.redirect("/blogs/"+req.params.id);
                }
    });
});

app.delete("/blogs/:id",function(req,res){
    Blog.findByIdAndRemove(req.params.id,function(err){
            if(err){
                res.redirect("/blogs");
            }
            else{
                res.redirect("/blogs");
            }
    });  
});


app.listen(process.env.PORT,process.env.IP,function(){
     console.log("Blogs server has started");
});
