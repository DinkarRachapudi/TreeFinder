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


var cubeInstance = require('./models/cube_instance.js');
var cubeCompositeInstance = require('./models/cubeComposite_instance.js');
var xmlDocument = require('./models/xml_document.js');

var beginDate = '1900-01-01 00:00:00.000';
var endDateAsDate = new Date();
var endDate = endDateAsDate.getFullYear() + "-" + (endDateAsDate.getMonth()+1) + "-" + endDateAsDate.getDate() +  
 " " + endDateAsDate.getHours() + ":" + endDateAsDate.getMinutes() + ":" +  endDateAsDate.getSeconds() + ".000";




app.get('/',function(req, res){
res.render('home');
});

app.get('/getInstances',function(req, res){

// Update beginDate and endDate if provided in params
if(req.query.startDate!=null && req.query.startDate.length>0)
beginDate=req.query.startDate;

beginDate = beginDate.replace("T", " ").replace("Z","");

if(req.query.endDate!=null && req.query.endDate.length>0)
endDate=req.query.endDate;

endDate = endDate.replace("T", " ").replace("Z","");



// Query by Instance Id
if(req.query.instanceId!=undefined){
console.log("received query by " + req.query.searchLevel);
if(req.query.searchLevel=="bpel"){
cubeInstance.find({CIKEY:Number(req.query.instanceId),"MODIFY_DATE": {$gte: beginDate,$lt: endDate}},function(err, cubeinstances){
if (err){
console.log("Error finding instance " + req.query.instanceId + ' error is ' + err);
res.send("Error retreiving instance for: " + req.query.instanceId + " Error is " + err);
}
else if (cubeinstances.length==0){
console.log("No Instances found for Instance Id " + req.query.instanceId);
res.send("No Instances found for Instance Id " + req.query.instanceId);
}
else{
console.log('Found Instances for ' + req.query.instanceId + ' length is ' + cubeinstances.length);
res.type('json');
res.send({"instances":cubeinstances});
}
});
}
else if(req.query.searchLevel=="composite"){
cubeInstance.find({CMPST_ID:Number(req.query.instanceId),"MODIFY_DATE": {$gte: beginDate,$lt: endDate}},function(err, cubeinstances){
if (err){
console.log("Error finding instance " + req.query.instanceId + ' error is ' + err);
res.send("Error retreiving instance for: " + req.query.instanceId + " Error is " + err);
}
else if (cubeinstances.length==0){
console.log("No Instances found for Instance Id " + req.query.instanceId);
res.send("No Instances found for Instance Id " + req.query.instanceId);
}
else{
console.log('Found Instances for ' + req.query.instanceId + ' length is ' + cubeinstances.length);
res.type('json');
res.send({"instances":cubeinstances});
}
});
}
else {
res.send("Invalid Search Level");
}
}

// Query by Instance Title
else if(req.query.instanceTitle!=undefined){
console.log("received query by " + req.query.searchLevel);
if(req.query.searchLevel=="bpel"){
cubeInstance.find({ $text : { $search : req.query.instanceTitle },"MODIFY_DATE": {$gte: beginDate,$lt: endDate} }).exec(function(err, cubeinstances){
if (err){
console.log("Error finding instances with Title " + req.query.instanceTitle + ' Error is ' + err);
res.send("Error finding instances with Title " + req.query.instanceTitle + ' Error is ' + err);
}
else if(cubeinstances.length==0){
console.log("No Instances found with Title " + req.query.instanceTitle);
res.send("No Instances found with Title " + req.query.instanceTitle);
}
else{
console.log('Found Instances for ' + req.query.instanceTitle + ' length is ' + cubeinstances.length);
res.type('json');
res.send({"instances":cubeinstances});
}
});
}
else if(req.query.searchLevel=="composite"){
cubeCompositeInstance.find({ $text : { $search : req.query.instanceTitle },"MODIFY_DATE": {$gte: beginDate,$lt: endDate} }).exec(function(err, cubeCompositeInstances){
if (err){
console.log("Error finding instances with Title " + req.query.instanceTitle + ' Error is ' + err);
res.send("Error finding instances with Title " + req.query.instanceTitle + ' Error is ' + err);
}
else if(cubeCompositeInstances==undefined || cubeCompositeInstances.length==0){
console.log("No Instances found with Title " + req.query.instanceTitle);
res.send("No Instances found with Title " + req.query.instanceTitle);
}
else{
var cubeinstances = cubeCompositeInstances.map(function(obj){
return{
	CIKEY: obj.CIKEY,
	CREATION_DATE: obj.CREATION_DATE,
	CREATOR: obj.CREATOR,
	MODIFY_DATE: obj.MODIFY_DATE,
	MODIFIER: obj.MODIFIER,
	STATE: obj.STATE,
	PRIORITY: obj.PRIORITY,
	TITLE: obj.TITLE,
	STATUS: obj.STATUS,
	STAGE: obj.STAGE,
	CONVERSATION_ID: obj.CONVERSATION_ID,
	ROOT_ID: obj.ROOT_ID,
	PARENT_ID: obj.PARENT_ID,
	SCOPE_REVISION: obj.SCOPE_REVISION,
	SCOPE_CSIZE: obj.SCOPE_CSIZE,
	SCOPE_USIZE: obj.SCOPE_USIZE,
	PROCESS_TYPE: obj.PROCESS_TYPE,
	METADATA: obj.METADATA,
	EXT_STRING1: obj.EXT_STRING1,
	EXT_STRING2: obj.EXT_STRING2,
	EXT_INT1: obj.EXT_INT1,
	TEST_RUN_ID: obj.TEST_RUN_ID,
	TEST_RUN_NAME: obj.TEST_RUN_NAME,
	TEST_CASE: obj.TEST_CASE,
	TEST_SUITE: obj.TEST_SUITE,
	ECID: obj.ECID,
	CMPST_ID: obj.CMPST_ID,
	OUTCOME: obj.OUTCOME,
	TRACKING_LEVEL: obj.TRACKING_LEVEL,
	AT_EVENT_ID: obj.AT_EVENT_ID,
	AT_DETAIL_ID: obj.AT_DETAIL_ID,
	VERSION: obj.VERSION,
	AG_ROOT_ID: obj.AG_ROOT_ID,
	AG_MILESTONE_PATH: obj.AG_MILESTONE_PATH,
	CACHE_VERSION: obj.CACHE_VERSION,
	PARENT_REF_ID: obj.PARENT_REF_ID,
	COMPONENTTYPE: obj.COMPONENTTYPE,
	NOTM: obj.NOTM,
	COMPOSITE_NAME: obj.COMPOSITE_NAME,
	DOMAIN_NAME: obj.DOMAIN_NAME,
	COMPONENT_NAME: obj.COMPONENT_NAME,
	COMPOSITE_LABEL: obj.COMPOSITE_LABEL,
	COMPOSITE_REVISION: obj.COMPOSITE_REVISION,
	CREATE_CLUSTER_NODE_ID: obj.CREATE_CLUSTER_NODE_ID,
	LAST_CLUSTER_NODE_ID: obj.LAST_CLUSTER_NODE_ID,
	CPST_INST_CREATED_TIME: obj.CPST_INST_CREATED_TIME,
	TENANT_ID: obj.TENANT_ID
}
});
res.type('json');
res.send({"instances":cubeinstances});
}
});
}
else {
res.send("Invalid Search Level");
}
}

//Query by Process Name
else if(req.query.processName!=undefined){
if(req.query.searchLevel=="bpel"){
cubeInstance.find({COMPONENT_NAME:req.query.processName,"MODIFY_DATE": {$gte: beginDate,$lt: endDate}},function(err, cubeinstances){
if (err){
console.log("Error finding instances with Process Name " + req.query.processName + ' and start date ' + beginDate + ' and end date ' + endDateString + ' Error is ' + err);
res.send("Error finding instances with Process Name " + req.query.processName + ' Error is ' + err);
}
else if (cubeinstances.length==0){
console.log("No Instances found with Process Name " + req.query.processName + ' and date ' + beginDate);
res.send("No Instances found with Process Name " + req.query.processName);
}
else{
console.log('Found Instances for ' + req.query.processName + ' with type ' + typeof(cubeinstances) + ' length is ' + cubeinstances.length);
console.log('process name is ' + cubeinstances[0].COMPONENT_NAME);
res.type('json');
res.send({"instances":cubeinstances});
}
});
}
else if(req.query.searchLevel=="composite"){
cubeInstance.find({COMPOSITE_NAME:req.query.processName,"MODIFY_DATE": {"$gte": beginDate,$lt: endDate}},function(err, cubeinstances){
if (err){
console.log("Error finding instances with Process Name " + req.query.processName + ' Error is ' + err);
res.send("Error finding instances with Process Name " + req.query.processName + ' Error is ' + err);
}
else if (cubeinstances.length==0){
console.log("No Instances found with Process Name " + req.query.processName);
res.send("No Instances found with Process Name " + req.query.processName);
}
else{
console.log('Found Instances for ' + req.query.processName + ' length is ' + cubeinstances.length);
res.type('json');
res.send({"instances":cubeinstances});
}
});
}
else {
res.send("Invalid Search Level");
}
}

// Advanced search by Elem name and value
else if(req.query.elementName!=undefined && req.query.elementValue!=undefined){

var regex = new RegExp(req.query.elementName + ".{1,10}" + req.query.elementValue, "g");
xmlDocument.find({ $text : { $search : { $regex: regex } } }).exec(function(err, xmlDocumentInstances){
if (err){
console.log("Error finding instances for " + req.query.elementName + " " + req.query.elementValue + ' error is ' + err);
res.send("Error finding instances for " + req.query.elementName + " " + req.query.elementValue);
}
else if (xmlDocumentInstances.length==0){
console.log("No Instances found for " + req.query.elementName + " " + req.query.elementValue);
res.send("No Instances found for " + req.query.elementName + " " + req.query.elementValue);
}
else{
console.log('Found Instances for ' + req.query.elementName + ' ' + req.query.elementValue + ' length is ' + xmlDocumentInstances.length);
res.type('json');
res.send({"instances":xmlDocumentInstances});
}
});
}

else if(req.query.ecid!=undefined){

cubeInstance.find({ECID:req.query.ecid},function(err, cubeinstances){
if (err){
console.log("Error finding instance " + req.query.instanceId + ' error is ' + err);
}
else{
console.log('Found Instances for ecid ' + req.query.ecid + ' length is ' + cubeinstances.length);
res.type('json');
res.send({"instances":cubeinstances});
}
});
}

else {
res.send("Invalid search parameters. Please retry with valid parameters");
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

