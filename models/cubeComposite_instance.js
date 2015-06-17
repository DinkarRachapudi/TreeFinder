var mongoose = require('mongoose');
var textSearch = require("mongoose-text-search");

var cubeComposite_instanceSchema = new mongoose.Schema({
    CIKEY: Number,
	CREATION_DATE: String,
	MODIFY_DATE: String,
	STATE: String,
	PRIORITY: String,
	TITLE: String,
	STATUS: String,
	ROOT_ID: String,
	PARENT_ID: String,
	ECID: String,
	CMPST_ID: Number,
	PARENT_REF_ID: String,
	COMPONENTTYPE: String,
	COMPOSITE_NAME: String,
	DOMAIN_NAME: String,
	COMPONENT_NAME: String,
	COMPOSITE_REVISION: String,
	CPST_INST_CREATED_TIME: String,
	COMPTITLE: String
},{ collection : 'cubeComposite_instance' });

cubeComposite_instanceSchema.plugin(textSearch);
cubeComposite_instanceSchema.index({
    COMPTITLE            :"text",
}, {
    name: "TITLE_text",
    weights: {
        COMPTITLE: 1,
    }
});


var cubeCompositeInstance = mongoose.model('cubeCompositeInstance', cubeComposite_instanceSchema);
module.exports = cubeCompositeInstance;