const mongoose=require('mongoose')



 mongoose.connect("mongodb://localhost:27017/yelp_camp",{
 	useNewUrlParser:true,
 	useUnifiedTopology:true
 });
//const MONGODB_URI= "mongodb+srv://shubham:rusty@cluster0-w9n3n.mongodb.net/test?retryWrites=true&w=majority";
//mongoose.connect(MONGODB_URI);


// mongodb+srv://shubham:rusty@cluster0-w9n3n.mongodb.net/test?retryWrites=true&w=majority
