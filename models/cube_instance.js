var mongoose = require('mongoose');
var textSearch = require("mongoose-text-search");

var cube_instanceSchema = new mongoose.Schema({
    CIKEY: Number,
	CREATION_DATE: String,
	CREATOR: String,
	MODIFY_DATE: String,
	MODIFIER: String,
	STATE: String,
	PRIORITY: String,
	TITLE: String,
	STATUS: String,
	STAGE: String,
	CONVERSATION_ID: String,
	ROOT_ID: String,
	PARENT_ID: String,
	SCOPE_REVISION: String,
	SCOPE_CSIZE: String,
	SCOPE_USIZE: String,
	PROCESS_TYPE: String,
	METADATA: String,
	EXT_STRING1: String,
	EXT_STRING2: String,
	EXT_INT1: String,
	TEST_RUN_ID: String,
	TEST_RUN_NAME: String,
	TEST_CASE: String,
	TEST_SUITE: String,
	ECID: String,
	CMPST_ID: String,
	OUTCOME: String,
	TRACKING_LEVEL: String,
	AT_EVENT_ID: String,
	AT_DETAIL_ID: String,
	VERSION: String,
	AG_ROOT_ID: String,
	AG_MILESTONE_PATH: String,
	CACHE_VERSION: String,
	PARENT_REF_ID: String,
	COMPONENTTYPE: String,
	NOTM: String,
	COMPOSITE_NAME: String,
	DOMAIN_NAME: String,
	COMPONENT_NAME: String,
	COMPOSITE_LABEL: String,
	COMPOSITE_REVISION: String,
	CREATE_CLUSTER_NODE_ID: String,
	LAST_CLUSTER_NODE_ID: String,
	CPST_INST_CREATED_TIME: String,
	TENANT_ID: String
	
},{ collection : 'cube_instance' });

cube_instanceSchema.plugin(textSearch);
cube_instanceSchema.index({
    TITLE            :"text",
}, {
    name: "TITLE_text",
    weights: {
        TITLE: 1,
    }
});


var cubeInstance = mongoose.model('cubeInstance', cube_instanceSchema);
module.exports = cubeInstance;