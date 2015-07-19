package com.dinkarrachapudi.soatreefinder;


import java.io.FileWriter;
import java.io.IOException;
import javax.sql.DataSource;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.jdbc.core.JdbcTemplate;

public class OracleDBReader implements IReader{
	
	   private DataSource dataSource;
	   private JdbcTemplate jdbcTemplateObject;
	   private FileWriter fileWriter;
	   private String countSQL;
	   private double numberOfthreads;
	   
	   public void setDataSource(DataSource dataSource) {
		      this.dataSource = dataSource;
		      this.jdbcTemplateObject = new JdbcTemplate(dataSource);
		   }
	   
	   public void setNumberOfthreads(int numberOfthreads){
		   this.numberOfthreads = numberOfthreads;
	   }
	   
	   public void setCountSQL(String countSQL){
		   this.countSQL = countSQL;
	   }

	   @Override
	public void fetchData(){
		   double totalRecords = jdbcTemplateObject.queryForObject(countSQL, Double.class);
		   System.out.println("Total records are " + totalRecords);
		   int recordsPerThread = (int)Math.ceil(totalRecords/numberOfthreads);
		   int startRow = 0;
		   int endRow = recordsPerThread;
		   ApplicationContext ctx = new ClassPathXmlApplicationContext("tree-finder-beans.xml");
		   for(int i=1;i<=numberOfthreads;i++){
			   ReaderThread readerThread = (ReaderThread)ctx.getBean("readerThread");
			   readerThread.setThreadName("Thread-"+i);
			   readerThread.setStartRow(startRow);
			   readerThread.setEndRow(endRow);
			   readerThread.start();
			   startRow = endRow;
			   endRow = endRow + recordsPerThread;
		   }
	}
	   
	   public void closeReader(){
		   try{
		   fileWriter.close();
		   }
		   catch(IOException e) {
			   System.out.println("IOException: " + e);
		   }
	   }
}

