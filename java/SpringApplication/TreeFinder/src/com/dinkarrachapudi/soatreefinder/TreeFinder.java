package com.dinkarrachapudi.soatreefinder;

import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.ServerAddress;
import java.io.IOException;
import java.util.Arrays;
import org.bson.Document;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;



public class TreeFinder {
	 
	public static void main(String[] args) {
		ApplicationContext ctx = new ClassPathXmlApplicationContext("tree-finder-beans.xml");
		
		
		ReaderFacade readerFacade = (ReaderFacade)ctx.getBean("readerFacade");
		readerFacade.readData();
		
		MongoClient mongoClient = new MongoClient(Arrays.asList(new ServerAddress("127.0.0.1", 27017)));
	     MongoDatabase db = mongoClient.getDatabase("soainfra");
	     MongoCollection<Document> coll = db.getCollection("cubeComposite_instance");
	     coll.drop();
	     System.out.println("Deleted mongo records");
		
		try{
		System.out.println("Executing " + System.getProperty("user.dir")+"\\mongImport.bat");
		Runtime.getRuntime().exec("cmd /c start " + System.getProperty("user.dir")+"\\mongImport.bat");
		System.out.println("MongoDB import complete");
		}
		catch(IOException e){
			System.out.println("IOException: " + e);
		}
		
	}

}
