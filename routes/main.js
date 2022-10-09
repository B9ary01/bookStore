
module.exports = function(app) { 

app.get('/',function(req,res){  res.render('index.html')  });	
app.get('/register', function(req,res) { res.render('register.html');  });
app.get('/login', function(req,res) { res.render('login.html');  });

app.get('/addbook',function(req,res){ res.render('addbook.html');  });
app.get('/about',function(req,res){ res.render('about.html');  });

//mongo url
var url="mongodb+srv://test123:test@cluster0.vef7a.mongodb.net/?retryWrites=true&w=majority"
var MongoClient = require('mongodb').MongoClient;

//register users
app.post('/registered' ,function (req, res) { 

const plainPassword = req.body.password;
  const firstName = req.body.fname;
MongoClient.connect(url, function(err, client) {    
if (err) throw err;
var db = client.db ('mybookshopdb');
  var bcrypt = require('bcrypt'); 
const saltRounds = 10;

if (!plainPassword) {
res.redirect('./register');
}else{
db.collection('users').findOne({
//if new user email matches with the registered users, below message is displayed
email:req.body.email
}).then(function (user) {
if(user){res.send( '<a href='+'http://localhost:3000/'+'>Home</a>'+
'<br />'+ '<br />'
+" Please try again! this email address already exists in the database.");
}else{

//hashing password to insert into database using bcrypt hash which outputs unique password by adding salt
bcrypt.hash(plainPassword,saltRounds, function (err, hash) {
//saving username, hashed password and email into database	
db.collection('users').insertOne({
fname:firstName,
  lname:req.body.lname,
username:req.body.username,
password:hash,
email:req.body.email
}).then(function(data) {
if (data) {
res.send( '<a href='+'http://localhost:3000/'+'>Home</a>'+ '<br />'+
'You are now registered, Your username is: '+ req.body.username
+ ', your password is: '+ plainPassword +
' and your hashed password is: '+ hash);
}; });  });} });}  });  });



//bookadded route
app.post('/bookadded', function (req,res) {
    // saving data in database
            
         MongoClient.connect(url, async function(err, client) {
            if (err) throw err;
                  var db = await client.db ('mybookshopdb');  
    //insert books with price into database	   
           

    await db.collection('books').insertOne({
                       name: req.body.name,
                         price: req.body.price                                                                                                
                         });
                           client.close();
      res.send( '<a href='+'http://localhost:3000/'+'>Home</a>'+ 
      '<br />'+'This book is added to the database, name: '+ req.body.name + ' and price is : £'+ req.body.price);   
         });  }); 


//display all the available books
app.get('/booklist', function(req, res) {
   
              MongoClient.connect(url, async function (err, client) {
                    if (err) throw err;
           var db = await client.db('mybookshopdb');
            await db.collection('books').find().toArray((findErr, results) => {
                 if (findErr) throw findErr;
               else
           res.render('booklist.ejs', {availablebooks:results});
           client.close();
        }); });  });

}
   