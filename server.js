#!/bin/env node

var express = require('express');

var app = express();

var autoViews = {};
var fs = require('fs');


var server_port = 3000
var hostName = require('os').hostname();
var server_ip_address = hostName || 'localhost'

app.use(express.static(__dirname + '/public'));



var handlebars = require('express-handlebars').create({defaultLayout:'main',helpers:{inc:function(value, options){
return parseInt(value) + 1;
}}});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');



var mongoose = require('mongoose');

var credentials = require('./models/credentials.js');
var parameters = require('./models/parameters.js');
var syncProcessesList = parameters.syncProcessesList;
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


var processes = [];
cubeCompositeInstance.distinct('COMPONENT_NAME',function(err, docs){
console.log("Processes: " + JSON.stringify(docs));
processes = docs;
});

app.get('/',function(req, res){
res.render('home');
});

app.get('/getProcesses',function(req, res){
res.type('json');
res.send({"processes":processes});
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

app.get('/getReports',function(req, res){
res.render('reports');
});

app.get('/getReport',function(req, res){
var query = {'STATE':1,'COMPONENT_NAME':{$in:syncProcessesList},"CREATION_DATE": {$gte: req.query.startDate,$lt: req.query.endDate}};
cubeCompositeInstance.find(query,function(err, stuckInstances){
if (err){
console.log("Error finding instances: " + err);
res.send("Error finding instances: " + err);
}
else if (stuckInstances.length==0){
console.log("No Instances found with search parameters");
res.send("No Instances found between " + req.query.startDate + " and " + req.query.endDate);
}
else{
console.log('Found Instances.' + ' Length is ' + stuckInstances.length);
res.type('json');
res.send({"stuckInstances":stuckInstances});
}
}).limit(10000).sort("-MODIFY_DATE");
});


app.get('/updateStuckInstance',function(req, res){
var conditions = {CIKEY:Number(req.query.cikey)};
var options = {multi:true};
var update = {REPORTS:{SYNCHRONOUS_STUCK:{}}};
if(req.query.issueStatus!=undefined && req.query.issueStatus.length>0)
update.REPORTS.SYNCHRONOUS_STUCK['ISSUE_STATUS'] = req.query.issueStatus;
if(req.query.issueType!=undefined && req.query.issueType.length>0)
update.REPORTS.SYNCHRONOUS_STUCK['ISSUE_TYPE'] = req.query.issueType;
if(req.query.application!=undefined && req.query.application.length>0)
update.REPORTS.SYNCHRONOUS_STUCK['APPLICATION'] = req.query.application;
if(req.query.comments!=undefined && req.query.comments.length!=undefined && req.query.comments.length>0)
update.REPORTS.SYNCHRONOUS_STUCK['COMMENTS'] = req.query.comments;
if(req.query.updatedBy!=undefined && req.query.updatedBy.length>0)
update.REPORTS.SYNCHRONOUS_STUCK['UPDATED_BY'] = req.query.updatedBy;

console.log("conditions-" + JSON.stringify(conditions) + " update-" + JSON.stringify(update));

cubeCompositeInstance.update(conditions,{ $set: update},updateCallback);

function updateCallback(err, numAffected){
if (err){
console.log("Error updating instances: " + err);
res.send("Error updating instances: " + err);
}
else{
console.log('Updated ' + JSON.stringify(numAffected) + ' records and type is ' + typeof(numAffected));
res.send('Updated ' + numAffected.nModified + ' records');
}
}
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

