package com.dinkarrachapudi.soatreefinder;

import com.mongodb.BasicDBObject;
import com.mongodb.client.MongoCursor;
import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.ServerAddress;
import java.io.File;
import java.io.FilenameFilter;
import java.io.IOException;
import java.util.Arrays;
import org.bson.Document;



public class ReaderFacade {
	IReader reader;
	String mongoHost;
	int mongoPort;
	String initialRun;
	String modifyDate ="1900-01-01 00:00:00";
	String mongoDBAggregateCommand;
	
	 public void setReader(IReader reader) {
	      this.reader = reader;
	   }
	 
	 public void setMongoHost(String mongoHost){
		 this.mongoHost = mongoHost;
	 }
	 
	 public void setMongoPort(int mongoPort){
		 this.mongoPort = mongoPort;
	 }
	 
	 public void setInitialRun(String initialRun){
		 this.initialRun = initialRun;
	 }
	 
	 public void setMongoDBAggregateCommand(String mongoDBAggregateCommand){
		 this.mongoDBAggregateCommand = mongoDBAggregateCommand;
	 }
	
	 /* The init method deletes the csv files generated from a prior run to ensure
	 duplicates are not inserted when data is imported from csv files. It also determines
	 the record with the greatest timestamp in mongoDB and uses this value for fetching 
	 records from Oracle DB which are greater than this timestamp for subsequent runs*/
	 
	 public void init(){
		 File dir = new File(System.getProperty("user.dir"));
		 File[] listOfCSVFiles = dir.listFiles(new FilenameFilter() {
			    public boolean accept(File dir, String name) {
			        return name.toLowerCase().endsWith(".csv");
			    }});
		 for(int i=0;i<listOfCSVFiles.length;i++){
			 listOfCSVFiles[i].delete();
		 }
		 
		 MongoClient mongoClient = new MongoClient(Arrays.asList(new ServerAddress(mongoHost, mongoPort)));
	     MongoDatabase db = mongoClient.getDatabase("soainfra");
	     MongoCollection<Document> coll = db.getCollection("cubeComposite_instance");
	     MongoCursor<Document> cursor = coll.find().sort(new BasicDBObject("MODIFY_DATE", -1)).limit(1).iterator() ;
	     
	     while (cursor.hasNext()) {
	    	 modifyDate = cursor.next().getString("MODIFY_DATE");
	     }
	 }
	 
	 /* This method calls appropriate overloading method based on the initialRun parameter */
	 public void readData(){
		 if(initialRun.equals("Y"))
		 reader.fetchData();
		 else {
			 reader.fetchData(modifyDate);
		 try{
			 System.out.println("Executing mongodb aggregate: " + mongoDBAggregateCommand);
			 Runtime.getRuntime().exec(mongoDBAggregateCommand);
			 System.out.println("Aggeregation complete");
		 }
		 catch(IOException e){
			 System.out.println("IOException during aggregation: " + e);
		 }
		 }
	 }
}
