
module.exports = function (app) {

    //if user is not loggedin, the user is redirected to the login page
    const redirectToLogin = (req, res, next) => { if (!req.session.userId ) {
      res.redirect('./login') }
            else { next (); }
  }

  app.get('/', function (req, res) { res.render('index.html') });
  app.get('/register', function (req, res) { res.render('register.html'); });
  app.get('/login', function (req, res) { res.render('login.html'); });

  app.get('/addbook',redirectToLogin, function (req, res) { res.render('addbook.html'); });
  app.get('/about', function (req, res) { res.render('about.html'); });

  app.get('/searchbooks',redirectToLogin, function (req, res) { res.render('searchBook.ejs'); });
  app.get('/deletebook',redirectToLogin,function (req, res) { res.render('deleteBook.html'); });



  //mongo url
  var url = "mongodb+srv://test123:test@cluster0.vef7a.mongodb.net/?retryWrites=true&w=majority"
  var MongoClient = require('mongodb').MongoClient;

  //register users
  app.post('/registered', function (req, res) {

    const plainPassword = req.body.password;
    const firstName = req.body.fname;
    MongoClient.connect(url, function (err, client) {
      if (err) throw err;
      var db = client.db('mybookshopdb');
      var bcrypt = require('bcrypt');
      const saltRounds = 10;

      if (!plainPassword) {
        res.redirect('./register');
      } else {
        db.collection('users').findOne({
          //if new user email matches with the registered users, below message is displayed
          email: req.body.email
        }).then(function (user) {
          if (user) {
            res.send('<a href=' + 'http://localhost:3000/' + '>Home</a>' +
              '<br />' + '<br />'
              + " Please try again! this email address already exists in the database.");
          } else {

            //hashing password to insert into database using bcrypt hash which outputs unique password by adding salt
            bcrypt.hash(plainPassword, saltRounds, function (err, hash) {
              //saving username, hashed password and email into database	
              db.collection('users').insertOne({
                fname: firstName,
                lname: req.body.lname,
                username: req.body.username,
                password: hash,
                email: req.body.email
              }).then(function (data) {
                if (data) {
                  res.send('<a href=' + 'http://localhost:3000/' + '>Home</a>' + '<br />' +
                    'You are now registered, Your username is: ' + req.body.username
                    + ', your password is: ' + plainPassword +
                    ' and your hashed password is: ' + hash);
                };
              });
            });
          }
        });
      }
    });
  });



  //login
  app.post('/loggedin', function (req, res) {
    const bcrypt = require('bcrypt');
    const plainPassword = req.body.password;

    MongoClient.connect(url, function (err, client) {
      if (err) throw err;
      var db = client.db('mybookshopdb');
      //match username saved in the database
      db.collection('users').findOne({
        username: req.body.username
      }).then(function (user) {

        //display invalid message if the username is wrong
        if (!user) {
          res.send('<a href=' + 'http://localhost:3000/login' + '>Back</a>' +
            '<br />' + '<br />' + " Please try again! Username is invalid");
        } else {

          //compare the password and hashed password from the database
          bcrypt.compare(plainPassword, user.password, function (err, result) {
            if (result == true) {
              // **** save user session here, when login is successful
              req.session.userId = req.body.username;
              //if result is true, display successful and unsuccessful if it is false
              res.send('<a href=' + 'http://localhost:3000/' + '>Home</a>' + '<br />' +
                '<br />' + " Login Successful!");
            }
            else {
              res.send('<a href=' + 'http://localhost:3000/login' + '>Back</a>' + '<br />' + '<br />' +
                " Please try again! Your password is not correct, Login UnSuccessful!");
            }
          });
        }
      });
    });
  });


  //bookadded route
  app.post('/bookadded', function (req, res) {
    // saving data in database

    MongoClient.connect(url, async function (err, client) {
      if (err) throw err;
      var db = await client.db('mybookshopdb');
      //insert books with price into database	   


      await db.collection('books').insertOne({
        name: req.body.name,
        price: req.body.price
      });
      client.close();
      res.send('<a href=' + 'http://localhost:3000/' + '>Home</a>' +
        '<br />' + 'This book is added to the database, name: ' + req.body.name + ' and price is : £' + req.body.price);
    });
  });


  //display all the available books
  app.get('/booklist', redirectToLogin ,function (req, res) {

    MongoClient.connect(url, async function (err, client) {
      if (err) throw err;
      var db = await client.db('mybookshopdb');
      await db.collection('books').find().toArray((findErr, results) => {
        if (findErr) throw findErr;
        else
          res.render('booklist.ejs', { availablebooks: results });
        client.close();
      });
    });
  });


  //listusers
  app.get('/listusers',redirectToLogin, function (req, res) {
    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect(url, function (err, client) {
      if (err) throw err;
      var db = client.db('mybookshopdb');
      db.collection('users').find().toArray((findErr, results) => {
        if (findErr) throw findErr;
        else
          res.render('userlist.ejs', { availableusers: results }); client.close();
      });
    });
  });



  //autocomplete book name if available 
  app.get('/autocomplete', function (req, res, next) {
    var regex = new RegExp(req.query["term"], 'i');
    MongoClient.connect(url, function (err, client) {
      var db = client.db('mybookshopdb');
      //search books available in the database
      db.collection('books').find({ name: regex }, { 'name': 1 }).toArray((findErr, results) => {
        var result = [];
        if (!err) {
          if (results && results.length > 0) {
            results.forEach(book => {
              let obj = {
                id: book.id,
                label: book.name + ", " + book.price
              }; result.push(obj);
            });
          }
          res.jsonp(result);
        }
      });
    });
  });

//Delete book from database 
app.post('/deletebooks', function (req,res) {
	MongoClient.connect(url,function(err, client) {
		if (err) throw err;
	var db = client.db('mybookshopdb');
	db.collection('books').findOne({ name:req.body.name
	}).then(function (name) {
	if(!name){
	res.send('<a href='+'http://localhost:3000/deletebook'+'>Go Back</a>'+ '<br />'+
	'<br />'+ " Please try again! bookname is not correct");}else
//delete book if bookname matches with the details saved in the database
	db.collection('books').deleteMany({
		name:req.body.name
	}).then(function (data){ 
	if(data){
		res.send( '<a href='+'http://localhost:3000/'+'>Home</a>'+ '<br />'+'Book data '+req.body.name+' is removed from database.'+ '<br />'+ " Please check the booklist page to confirm if the book is removed from database. ");
	} }); });
 }); 
});
	
//logout
app.get('/logout', redirectToLogin, (req,res) => {
	
	req.session.destroy(err => {
		if (err) {
			 return res.redirect('./')
		}
	res.send('You are now logged out. <a href='+'/'+'>Home</a>');
	}); });


}
