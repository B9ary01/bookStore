var MongoClient = require('mongodb').MongoClient;

var express = require ('express');
var session = require ('express-session');

const app = express()
var path=require('path');
var bodyParser= require ('body-parser');

const port = 3000;
                     
var url="mongodb+srv://test123:test@cluster0.vef7a.mongodb.net/?retryWrites=true&w=majority"


MongoClient.connect(url, function(err, db) {
    if (err) throw err;
  console.log("Database created!");
  
    db.close();    
 });

app.use(bodyParser.urlencoded({ extended: true }));


//session management 
app.use(session({
	secret: 'somerandomstuffs',
	resave: false, 
	saveUninitialized: false,
	cookie: { expires: 600000 } }));    

app.set('views', path.join(__dirname, 'views'));

require('./routes/main')(app);
app.set('views',__dirname + '/views');

app.set('view engine', 'ejs'); 
app.engine('html', require('ejs').renderFile);

app.listen(port, () => console.log(`app listening on port ${port}!`));
