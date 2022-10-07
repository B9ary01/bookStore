
module.exports = function(app) { 

app.get('/',function(req,res){  res.render('index.html')  });	
app.get('/addbook',function(req,res){ res.render('addbook.html');  });


}
   