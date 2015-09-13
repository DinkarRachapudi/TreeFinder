var conn = new Mongo();
var db = conn.getDB("soainfra");

   db.cubeComposite_instance.aggregate(
     [
       {
        $group : {
           _id : "$CIKEY",
		   CIKEY: { $first: "$CIKEY"},
		   CREATION_DATE: { $first: "$CREATION_DATE"},
		   MODIFY_DATE: { $max: "$MODIFY_DATE" },
		   STATE: { $max: "$STATE"},
		   PRIORITY: { $first: "$PRIORITY"},
		   TITLE: { $first: "$TITLE"},
		   STATUS: { $first: "$STATUS"},
		   ROOT_ID: { $first: "$ROOT_ID"},
		   PARENT_ID: { $first: "$PARENT_ID"},
		   ECID: { $first: "$ECID"},
		   CMPST_ID: { $first: "$CMPST_ID"},
		   PARENT_REF_ID: { $first: "$PARENT_REF_ID"},
		   COMPONENTTYPE: { $first: "$COMPONENTTYPE"},
		   COMPOSITE_NAME: { $first: "$COMPOSITE_NAME"},
		   DOMAIN_NAME: { $first: "$DOMAIN_NAME"},
		   COMPONENT_NAME: { $first: "$COMPONENT_NAME"},
		   COMPOSITE_REVISION: { $first: "$COMPOSITE_REVISION"},
		   CPST_INST_CREATED_TIME: { $first: "$CPST_INST_CREATED_TIME"},
		   COMPTITLE: { $first: "$COMPTITLE"}
        }
      },
	  { $out : "cubeComposite_instance" }
     ], {allowDiskUse:true}
   );