package com.dinkarrachapudi.soatreefinder;

import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.ServerAddress;
import java.io.File;
import java.io.FilenameFilter;
import java.util.Arrays;
import org.bson.Document;

public class ReaderFacade {
	IReader reader;
	String mongoHost;
	int mongoPort;
	
	 public void setReader(IReader reader) {
	      this.reader = reader;
	   }
	 
	 public void setMongoHost(String mongoHost){
		 this.mongoHost = mongoHost;
	 }
	 
	 public void setMongoPort(int mongoPort){
		 this.mongoPort = mongoPort;
	 }
	
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
	     coll.drop();
	     System.out.println("Deleted mongo records");
	 }
	 
	 
	 public void readData(){
		 reader.fetchData();
		 System.out.println("CSV write complete");
	 }
}
