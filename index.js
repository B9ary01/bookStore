
var express = require ('express');

const app = express()
var path=require('path');
var bodyParser= require ('body-parser');

const port = 3000;
                     
app.use(bodyParser.urlencoded({ extended: true }));


app.set('views', path.join(__dirname, 'views'));

require('./routes/main')(app);
app.set('views',__dirname + '/views');

app.set('view engine', 'ejs'); 
app.engine('html', require('ejs').renderFile);

app.listen(port, () => console.log(`app listening on port ${port}!`));
