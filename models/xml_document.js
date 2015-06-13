var mongoose = require('mongoose');
var textSearch = require("mongoose-text-search");

var xml_documentSchema = new mongoose.Schema({
    DOCUMENT_ID: String,
	DOCUMENT: String,
	DOCUMENT_BINARY_FORMAT: Number,
	DOCUMENT_TYPE: Number,
	DOC_PARTITION_DATE: Date,
	INSTANCE_ID: Number,
	INSTANCE_TYPE: String,
	PART_NAME: String,
	PAYLOAD_TYPE: Number,
	PAYLOAD_KEY: String,
	CREATED_TIME: Date,
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
	CMPST_ID: Number,
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
	
},{ collection : 'xml_document' });

xml_documentSchema.plugin(textSearch);
xml_documentSchema.index({
    DOCUMENT            :"text",
}, {
    name: "TITLE_text",
    weights: {
        DOCUMENT: 1,
    }
});


var xmlDocument = mongoose.model('xmlDocument', xml_documentSchema);
module.exports = xmlDocument;