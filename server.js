#!/bin/env node

var express = require('express');

var app = express();

var autoViews = {};
var fs = require('fs');


var server_port = 3000
var server_ip_address = 'localhost'

app.use(express.static(__dirname + '/public'));



var handlebars = require('express-handlebars').create({defaultLayout:'main',helpers:{inc:function(value, options){
return parseInt(value) + 1;
}}});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');



var mongoose = require('mongoose');

var credentials = require('./models/credentials.js');
var opts = {
server:{
socketOptions:{keepAlive:1}
}
};

mongoose.connect(credentials.mongo.development.connectionString, opts);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  
  console.log("Mongodb connection established");
});


var cubeCompositeInstance = require('./models/cubeComposite_instance.js');
//var xmlDocument = require('./models/xml_document.js');

var beginDate = '1900-01-01 00:00:00.000';
var endDateAsDate = new Date();
var endDate = endDateAsDate.getFullYear() + "-" + (endDateAsDate.getMonth()+1) + "-" + endDateAsDate.getDate() +  
 " " + endDateAsDate.getHours() + ":" + endDateAsDate.getMinutes() + ":" +  endDateAsDate.getSeconds() + ".000";




app.get('/',function(req, res){
res.render('home');
});

app.get('/getProcesses',function(req, res){
cubeCompositeInstance.distinct('COMPONENT_NAME',function(err, docs){
console.log("Processes: " + JSON.stringify(docs));
res.type('json');
res.send({"processes":docs});
})
});

app.get('/getInstances',function(req, res){

// Update beginDate and endDate if provided in params
if(req.query.startDate!=null && req.query.startDate.length>0)
beginDate=req.query.startDate;

beginDate = beginDate.replace("T", " ").replace("Z","");

if(req.query.endDate!=null && req.query.endDate.length>0)
endDate=req.query.endDate;

endDate = endDate.replace("T", " ").replace("Z","");

// Generic function included in model.find callback
function sendBackData(err, docs){
if (err){
console.log("Error finding instances: " + err);
res.send("Error finding instances: " + err);
}
else if (docs.length==0){
console.log("No Instances found with search parameters");
res.send("No Instances found with search parameters");
}
else{
console.log('Found Instances.' + ' Length is ' + docs.length);
res.type('json');
res.send({"instances":docs});
}
}

// Construct the query object based on the query parameters for using in model.find
var query = {};
if(req.query.instanceId!=undefined && req.query.searchLevel=="bpel")
query = {'CIKEY':Number(req.query.instanceId),"MODIFY_DATE": {$gte: beginDate,$lt: endDate}};
else if(req.query.instanceId!=undefined && req.query.searchLevel=="composite")
query = {'CMPST_ID':Number(req.query.instanceId),"MODIFY_DATE": {$gte: beginDate,$lt: endDate}};
else if(req.query.instanceTitle!=undefined && req.query.searchLevel!=undefined)
query = { $text : { $search : req.query.instanceTitle },"MODIFY_DATE": {$gte: beginDate,$lt: endDate} };
else if(req.query.processName!=undefined && req.query.searchLevel=="bpel")
query = {'COMPONENT_NAME':req.query.processName,"MODIFY_DATE": {$gte: beginDate,$lt: endDate}};
else if(req.query.processName!=undefined && req.query.searchLevel=="composite")
query = {'COMPOSITE_NAME':req.query.processName,"MODIFY_DATE": {$gte: beginDate,$lt: endDate}};
else if(req.query.ecid!=undefined)
query = {ECID:req.query.ecid};

cubeCompositeInstance.find(query,function(err, cubeinstances){
sendBackData(err,cubeinstances);
}).limit(10000).sort("-MODIFY_DATE");

});


// Automatic views rendering
app.use(function(req,res,next){
var path = req.path.toLowerCase();
if(autoViews[path])
 res.render(autoViews[path]);
else if(fs.existsSync(__dirname + '/views' + path + '.handlebars')){
console.log("found view " + path);
autoViews[path]=path.replace(/^\//,'');
console.log("rendering " + path.replace(/^\//,''));
res.render(autoViews[path]);
console.log("rendered " + path.replace(/^\//,''));
}
else{
next();
}
});

//404 Page
app.use(function(req, res, next){
res.type('text/plain');
res.status(404);
res.send('404 - Page not found');
});

//500 Page
app.use(function(err, req, res, next){
console.error(err.stack);
res.status(500);
res.send('500 - Internal Server Error');
});




app.listen(server_port, server_ip_address, function(){
  console.log("Listening on " + server_ip_address + ", server_port " + server_port);
});

