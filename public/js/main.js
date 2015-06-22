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


// Function called from Search/TreeFinder buttons
$scope.getInstances = function(searchById, searchByValue, searchByValueTwo, searchCriteria, startDate, endDate){
var cubeInstances;
dataService.getInstancesData(searchById,searchByValue,searchByValueTwo,searchCriteria,startDate,endDate,function(dataResponse) {
		if(dataResponse.instances!=undefined){
        $scope.instances = dataResponse.instances;
		cubeInstances = $scope.instances;
		$scope.getNoOfPages();
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
	
// Determine no of pages needed
$scope.getNoOfPages = function(){
$scope.pageStartInstances=[];
$scope.pagesToChop=0;
$scope.resultsPerPage = Number($scope.resultsPerPage);
for(i=0;i<$scope.instances.length;i+=$scope.resultsPerPage){
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
		if($scope.instances[i].PARENT_REF_ID==null || $scope.instances[i].PARENT_REF_ID.substring(0,8)=="mediator"){
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


});

// JQuery Tootltip
$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();	
});

$(document).ready(function() {
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
});

