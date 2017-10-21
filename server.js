var express		= require('express');
var app			= express();
var bodyParser	= require('body-parser');
var morgan		= require('morgan');
var mongoose	= require('mongoose');

var jwt 		= require('jsonwebtoken');
var config		= require('./config');
var Temperature	= require('./app/models/temperature');

/**
* configuration
*/

var port = process.env.PORT || 3000;
mongoose.connect(config.database);
app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));


app.get('/', function(req, res){
	res.send("The API is at http://localhost:" + port + "/api");
});

app.get('/setup/:token', function(req,res){
	if(req.params.token === config.secret){
		var mock = new Temperature({
			temperature: "25.4",
			date: "10-20-2017",
			hour: "11:25"
		});

		mock.save(function(err){
			if(err) throw err;
			console.log("Temperature saved successfully");
			res.json({sucess: true});
		});
	}else{
		res.json({status:400, message:'Invalid token'});
	}
	
});


var apiRoutes = express.Router();

apiRoutes.get('/', function(req, res){
	res.json({ message: 'Temperature API'});
});

apiRoutes.get('/temperatures/:token', function(req,res){
	if(req.params.token === config.secret)
		Temperature.find({}, function(err, temperatures){
			res.json(temperatures);
		});
	else
		res.json({status:400, message:'Invalid token'});
});

apiRoutes.post('/temperatures', function(req, res){
	var temperature = req.body.temperature;
	var date = req.body.date;
	var hour = req.body.hour;
	var token = req.body.token;

	console.log("TEMPERATURE = " + temperature);
	console.log("DATE = " + date);
	console.log("HOUR = " + hour);
	console.log("TOKEN = " + token);

	if(token === config.secret){
		var newTemp = new Temperature({
			temperature: temperature,
			date: date,
			hour: hour
		});

		newTemp.save(function(err){
			if(err){
				res.json({sucess: false});
			}
			console.log("Temperature saved successfully");
			res.json({sucess: true});
		});
	}else{
		res.json({sucess: false})
	}
});

apiRoutes.get('/lasttemperature/:token', function(req, res){
	var token = req.params.token;

	if(token === config.secret){
		//get all the records, sort by id(from newest to oldest) and return me only the first one
		var query = Temperature.find().sort({ $natural: -1 }).limit(1)

		query.exec(function(err, results){
			if(err)
				res.json({sucess: false});
			else 
				res.json(results)
		});
	}
});


app.use('/api', apiRoutes);

app.listen(port);

console.log('API is running at http://localhost:' + port);