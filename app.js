require('dotenv').config()
const express=require("express");
const ejs=require("ejs");                                                   
const bodyParser=require("body-parser");
const app=express();
const passport=require("passport");
const LocalStrategy=require("passport-local");
const passportLocalMongoose=require("passport-local-mongoose");
 
const multer=require("multer");                                        
const path=require("path");
var methodOverride=require("method-override");
const mongoose=require("mongoose");
 

  

mongoose.connect(process.env.MONGODB_URI,{
  	useNewUrlParser:true,
  	useUnifiedTopology:true});


  



var campgroundSchema=new mongoose.Schema({
	name:String,
	image:String,
	description:String
});

var Campground= mongoose.model("Campground",campgroundSchema);

 
var UserSchema=new mongoose.Schema({
	username:String,
	password:String,
	campgrounds:[campgroundSchema]
});

UserSchema.plugin(passportLocalMongoose)
const User=mongoose.model("User",UserSchema)


app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
 
app.use(express.static('public'));
app.use(methodOverride("_method"));


app.use(require("express-session")({
	secret:process.env.SECRET,
	resave:false,
	saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// multer------------------------------------------------------------------
var storage = multer.diskStorage({
  destination:'./public/uploads',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '_' + Date.now()+path.extname(file.originalname));
  }
 
})
 var upload = multer({ storage: storage,
  fileFilter(req,file,cab){
  	 if(!file.originalname.match(/\.(jpg|jpeg|gif|png)$/)){
  	   return cab(new Error("Please try again with a image"))
      }
     
      cab(undefined,true)
  }
}).single('file');

 //----------------------------------------------------------------- 

 

app.use(function(req,res,next){       
	res.locals.currentUser=req.user;
	next();
});

app.get("/",function(req,res){
	res. sendFile(__dirname+"/index.html");
	 
});

 

app.get("/campgrounds",isLoggedIn,function(req,res){
	User.findOne({username:req.user.username},function(error,user){         
		if(error){                                        
			// console.log(err)
			res.render("error",{error:error});
		}else{
           res.render("campgrounds",{campgrounds:user.campgrounds,currentUser:req.user});
            
		}
	}); 	
	  
});


app.get("/campgrounds/new",isLoggedIn,function(req,res){
	res.render("new");
});



app.post("/campgrounds",upload,isLoggedIn,function(req,res){
	 
	  var imageFile=req.file.filename;


	 
    User.findOne({username:req.user.username},function(error,user){         
		if(error){                                        
			console.log(error);
			 
		} else{
             Campground.create({ name:req.body.name,
                               image:imageFile,
                               description:req.body.desc},function(error,campground){
                if(error){
                	 // console.log(err)
                	   res.render("error",{error:error.message});
                }else{
                    user.campgrounds.push(campground);
                     user.save()
                     }
              })
           }
       res.redirect("/campgrounds");
	});
     
      
 },(error,req,res,next)=>{
 	   
    res.render("error",{error:error.message})
    
   
})

 

 

              // delete route
app.delete("/campgrounds/:id",function(req,res){
	User.findOne({username:req.user.username},(error,user)=>{
		if(error){
			// console.log(err)
			res.render("error",{error:error});
		} else{
             var index=user.campgrounds.map(function(item) {return item._id}).indexOf(req.params.id);
     
             user.campgrounds.splice(index,1);
             user.save();
            
              
            Campground.findByIdAndRemove(req.params.id,function(error){
               if(!error){ 		
                res.redirect("/campgrounds")
                }
             });
		}
	})
  
});             


//============================Auth Routes==================================================================

app.get("/register",function(req,res){
	res.render("register");
});

app.post("/register",function(req,res){
	 req.body.username
	req.body.password
	 User.register(new User({username:req.body.username}),req.body.password,function(error,user){
	 	if(error){
	 		// console.log(err);
	 		res.render("error",{error:error.message});
	 		// return res.render("register");
	 	}  
	 		passport.authenticate("local")(req,res,function(){
	 			res.redirect("/campgrounds");
	 		});
	 });
});

// this route only shows the login form
app.get("/login",function(req,res){
	res.render("login");
});

 
 app.post("/login",passport.authenticate("local",{
 	successRedirect:"/campgrounds",
 	failureRedirect:"/login"
 }),function(req,res){}); 

 app.get("/logout",function(req,res){
 	req.logout();
 	res.redirect("/");
 });

  app.get("/logout",function(req,res){
 	req.logout();
 	res.redirect("/");
 });

 function isLoggedIn(req,res,next){
 	if(req.isAuthenticated()){
 		return next();
 	}
 	res.redirect("/login");
 }


  

app.listen(process.env.PORT ||3000,()=>{
	console.log("server started on port 3000");
});