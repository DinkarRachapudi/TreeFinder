var treeFinderApp = angular.module('treeFinderApp',['ngRoute']);

// Configure app
treeFinderApp.config(function($interpolateProvider,$locationProvider) {
    $interpolateProvider.startSymbol('~~');
    $interpolateProvider.endSymbol('~~');
	$locationProvider.html5Mode(true);
  });

// Custom filter for pagination  
treeFinderApp.filter('spliceFilter',function(){
return function(inputArray,noOfElemsToRemove){
return inputArray.slice(noOfElemsToRemove);
}
});

  
// Service which actually performs the http call
treeFinderApp.service('dataService', function($http) {
delete $http.defaults.headers.common['X-Requested-With'];
this.getInstancesData = function(paramName,paramValue, paramValueTwo, searchCriterion,fromDate, toDate, callbackFunc) {
var httpcall;

switch (paramName) {
    case 'Instance Id':
        httpcall = $http({
        method: 'GET',
        url: '/getInstances',
        params: {instanceId:paramValue,searchLevel:searchCriterion,startDate:fromDate,endDate:toDate}
     });
        break;
    case 'Title':
		httpcall = $http({
        method: 'GET',
        url: '/getInstances',
        params: {instanceTitle:paramValue,searchLevel:searchCriterion,startDate:fromDate,endDate:toDate}
        });
        break;
    case 'Prcoess Name':
        httpcall = $http({
        method: 'GET',
        url: '/getInstances',
        params: {processName:paramValue,searchLevel:searchCriterion,startDate:fromDate,endDate:toDate}
        });
        break;
    case 'Advanced':
        httpcall = $http({
        method: 'GET',
        url: '/getInstances',
        params: {elementName:paramValue,elementValue:paramValueTwo,searchLevel:searchCriterion,startDate:fromDate,endDate:toDate}
        });
        break;
		case 'ecid':
        httpcall = $http({
        method: 'GET',
        url: '/getInstances',
        params: {ecid:paramValue}
        });
        break;
} 

	httpcall.success(function(data){
         callbackFunc(data);
    }).error(function(){
		$scope.errorMessage="Error fetching instances";
    });
 }
 
 this.getProcessesData = function(callbackFunc){
 var httpcall = $http({
        method: 'GET',
        url: '/getProcesses',
        params: {}
        });
		httpcall.success(function(data){
         callbackFunc(data);
    }).error(function(){
		$scope.processes=[];
    });
 }
 
  this.getStuckInstancesData = function(searchStartDate,searchEndDate,callbackFunc){
 var httpcall = $http({
        method: 'GET',
        url: '/getReport',
        params: {startDate:searchStartDate,endDate:searchEndDate}
        });
		httpcall.success(function(data){
         callbackFunc(data);
    }).error(function(){
		$scope.errorMessage="Error fetching instances";
    });
 }
 
 this.updateStuckInstanceData = function(InstanceId,IssueStatus,IssueType,Application,Comments,UpdatedBy,callbackFunc){
 var httpcall = $http({
        method: 'GET',
        url: '/updateStuckInstance',
        params: {cikey:InstanceId,issueStatus:IssueStatus,issueType:IssueType,application:Application,comments:Comments,updatedBy:UpdatedBy}
        });
		httpcall.success(function(data){
		callbackFunc(data);
         //$scope.updateMessage=data;
    }).error(function(){
		$scope.updateMessage="Error updating instances";
    });
 }
 
});

// App's controller
treeFinderApp.controller("treeFinderController",function($scope,dataService,$location){

// Initialize scope variables
$scope.treeInstances = [];
$scope.pageStartInstances = [];
var startDateAsDate = new Date();
startDateAsDate.setFullYear(2010, 0, 01);
$scope.startDate = startDateAsDate.toISOString();
var endDateAsDate = new Date();
$scope.endDate = endDateAsDate.toISOString();
$scope.searchTypes=['Instance Id','Title','Process Name','Advanced'];
$scope.SearchIdentifierValue="";
$scope.instances=[];
$scope.pagesToChop = 0;
$scope.resultsPerPage = 10;
$scope.showLoadingImg = false;
$scope.processes = [];
$scope.showSuggestedProcesses = false;
$scope.stuckInstances=[];
$scope.showComments=false;
$scope.activePageName="Instances";
$scope.currentPageName="";


// Function called from Search/TreeFinder buttons
$scope.getInstances = function(searchById, searchByValue, searchByValueTwo, searchCriteria, startDate, endDate){
var cubeInstances;
dataService.getInstancesData(searchById,searchByValue,searchByValueTwo,searchCriteria,startDate,endDate,function(dataResponse) {
		if(dataResponse.instances!=undefined){
        $scope.instances = dataResponse.instances;
		cubeInstances = $scope.instances;
		$scope.getNoOfPages("home");
		}
		else {
		$scope.errorMessage=dataResponse;
		}
		
    });
return $scope.instances;
	}

$scope.onInstanceSearch = function(){
$scope.showLoadingImg=true;
}

$scope.getProcesses = function(){
dataService.getProcessesData(function(dataResponse){
if(dataResponse.processes!=undefined){
$scope.processes = dataResponse.processes;
}
else {
$scope.processes = [];
}
});
}

	
// Determine no of pages needed
$scope.getNoOfPages = function(pageName){
pageName = pageName ==null ? "home" : pageName;
$scope.pageStartInstances=[];
$scope.pagesToChop=0;
$scope.resultsPerPage = Number($scope.resultsPerPage);
var instancesLength = 0;
if(pageName=="home")
instancesLength = $scope.instances.length;
else if(pageName=="reports")
instancesLength = $scope.stuckInstances.length;
console.log("scope instances length is " + $scope.instances.length + " and instancesLength is " + instancesLength + " type of instancesLength is " + typeof(instancesLength));
for(i=0;i<instancesLength;i+=$scope.resultsPerPage){
i = Number(i);
$scope.pageStartInstances.push(i+1);
}
}

// Function for accessing root scope variables
$scope.getCtrlScope = function(){
return $scope;
}


// Function returning instance state as string based on integer value
$scope.getState = function(stateNum){
var state;
switch (stateNum) {
    case '1':
        state="Running";
        break;
    case '3':
        state="Faulted";
        break;
	case "5":
        state="Completed";
        break;
	case '6':
        state="Faulted";
        break;
	case '8':
        state="Aborted";
        break;
	case '9':
        state="Stale";
        break;
	case '32':
        state="Completed";
        break;
	default:
		state="Running";
}
return state;
}

// Utility function for retrieving instance by cikey
$scope.returnInstanceByCIKEY = function(cikey){
var instanceDetails;
for(i=0;i<$scope.instances.length;i++){
if(cikey==$scope.instances[i].CIKEY){
instanceDetails=$scope.instances[i];
}
}
return instanceDetails;
}


// Function supporting sorting feature
$scope.sortInstancesByRecDate = function(ascending){
if(ascending){
$scope.instances.sort(function(a,b){
		return new Date(a.CREATION_DATE)-new Date(b.CREATION_DATE)});
}
else {
$scope.instances.sort(function(a,b){
		return new Date(b.CREATION_DATE)-new Date(a.CREATION_DATE)});
}
}

$scope.sortInstancesByModDate = function(ascending){
if(ascending){
$scope.instances.sort(function(a,b){
		return new Date(a.MODIFY_DATE)-new Date(b.MODIFY_DATE)});
}
else {
$scope.instances.sort(function(a,b){
		return new Date(b.MODIFY_DATE)-new Date(a.MODIFY_DATE)});
}
}


// Functions for CSS styling
$scope.getInstanceColor = function(state,alert){
var colorClass;
switch (state) {
    case '1':
        colorClass="info";
        break;
    case '3':
        colorClass="danger";
        break;
	case "5":
        colorClass="success";
        break;
	case '6':
        colorClass="danger";
        break;
	case '8':
        colorClass="warning";
        break;
	case '9':
        colorClass="warning";
        break;
	case '32':
        colorClass="success";
        break;
	default:
		colorClass="info";
} 
if(alert){
colorClass = "alert alert-" + colorClass;
}
return colorClass;
}

$scope.getCheckedStyle = function(checkBy){
var style="label label-default";
if(checkBy==$scope.searchCriteria || checkBy==$scope.searchBy)
style="label label-primary";
return style;
}

$scope.getActivePageStyle = function(pageno){
var style="";
if(pageno==$scope.pagesToChop+1)
style="active";
return style;
}

$scope.getActiveMenuStyle = function(pageName){
var style="";
if(pageName==$scope.activePageName)
style="activeMenu";
if(pageName=="Reports")
style= style + " dropdown";
return style;
}

$scope.getActiveFontStyle = function(pageName){
var style="whiteFont";
if(pageName==$scope.activePageName)
style="primaryFont";
return style;
}

$scope.getMenuStyleByEvent = function(event,pageName){
if(event=="click"){
$scope.currentPageName=$scope.activePageName;
$scope.activePageName=pageName;
console.log("backed up page name is  " + $scope.currentPageName);
}
else if(event=="blur"){
$scope.activePageName=$scope.currentPageName;
//console.log("blurred page name is now " + $scope.activePageName);
}
console.log(event + " " + pageName + " " + $scope.activePageName);
}


$scope.getReportInstanceColor = function(IssueStatus){
var colorClass ="alert alert-warning";
if(IssueStatus=="Closed"){
colorClass = "alert alert-success";
}
return colorClass;
}

// Fetching HTTP GET parameters
$scope.paramObj = $location.search();

// Functions for supporting tree finder view
$scope.getTreeFinderInstances = function(cikey){
dataService.getInstancesData('Instance Id',cikey,'','bpel','','',function(dataResponse) {
        $scope.getSubsequentChildren(dataResponse.instances[0].ECID); 
    });

}

$scope.getSubsequentChildren = function(ecid){
dataService.getInstancesData('ecid',ecid,'','bpel','','',function(dataResponse) {
        $scope.instances = dataResponse.instances;
		$scope.instances.sort(function(a,b){
		return a.CIKEY-b.CIKEY});
		for(i=0;i<$scope.instances.length;i++){
		console.log($scope.instances[i].CIKEY + ":" + $scope.instances[i].PARENT_REF_ID);
		if($scope.instances[i].PARENT_REF_ID==null || $scope.instances[i].PARENT_REF_ID.substring(0,8)=="mediator" || $scope.instances[i].PARENT_REF_ID=="null"){
		$scope.treeInstances.push({cikey:$scope.instances[i].CIKEY,children:[]});
}
}		
});
}

$scope.addChildToTree = function(data){
for(i=0;i<$scope.instances.length;i++){
if($scope.instances[i].PARENT_REF_ID!=null && data.cikey==$scope.instances[i].PARENT_REF_ID.substr(0,$scope.instances[i].PARENT_REF_ID.indexOf('-'))){
data.children.push({cikey:$scope.instances[i].CIKEY,children:[]});
}
}
}

$scope.getParent = function(parentRefId){
var parentInstance;
for(i=0;i<$scope.instances.length;i++){
if(parentRefId!=null && $scope.instances[i].CIKEY==parentRefId.substr(0,parentRefId.indexOf('-'))){
parentInstance=$scope.instances[i];
}
}
return parentInstance;
}	

$scope.getStuckInstances = function(stuckInstancesDate){
var startDate = new Date(stuckInstancesDate);
var startDateString = startDate.getFullYear() + "-" + ("0" + (startDate.getMonth()+1)).slice(-2) + "-" + 
("0" + startDate.getDate()).slice(-2) +  " 00:00:00.000"; 
var endDate = new Date(stuckInstancesDate);
endDate = new Date(endDate.setDate(endDate.getDate() + 1));
var endDateString = endDate.getFullYear() + "-" + ("0" + (endDate.getMonth()+1)).slice(-2)  + "-" + 
("0" + endDate.getDate()).slice(-2) +  " 00:00:00.000"; 
dataService.getStuckInstancesData(startDateString,endDateString,function(dataResponse) {
		if(dataResponse.stuckInstances!=undefined){
        $scope.stuckInstances = dataResponse.stuckInstances;
		$scope.getNoOfPages("reports");
		}
		else {
		$scope.errorMessage=dataResponse;
		$scope.stuckInstances = [];
		}
		
    });
}

$scope.updateStuckInstance = function(InstanceId,IssueStatus,IssueType,Application,Comments,UpdatedBy){
dataService.updateStuckInstanceData(InstanceId,IssueStatus,IssueType,Application,Comments,UpdatedBy,function(dataResponse) {
        $scope.updateMessage=dataResponse; 
    });
}



});

// JQuery Tootltip
$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();	
});

$(document).ready(function() {
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
});

//JQuery Datepicker
  $(function() {
    $( "#datepicker" ).datepicker();
  });
