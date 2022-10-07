
module.exports = function(app) { 

app.get('/',function(req,res){  res.render('index.html')  });	
app.get('/addbook',function(req,res){ res.render('addbook.html');  });

//mongo url
var url="mongodb+srv://test123:test@cluster0.vef7a.mongodb.net/?retryWrites=true&w=majority"

//bookadded route
app.post('/bookadded', function (req,res) {
    // saving data in database
        var MongoClient = require('mongodb').MongoClient;
            
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

}
   