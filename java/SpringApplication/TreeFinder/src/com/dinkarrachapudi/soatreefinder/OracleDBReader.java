package com.dinkarrachapudi.soatreefinder;


import java.io.FileWriter;
import java.io.IOException;
import javax.sql.DataSource;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.jdbc.core.JdbcTemplate;

public class OracleDBReader implements IReader{
	
	   DataSource dataSource;
	   JdbcTemplate jdbcTemplateObject;
	   FileWriter fileWriter;
	   String countSQL;
	   String SQL;
	   double numberOfthreads;
	   ApplicationContext ctx;
	   
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
	   
	   public void setSQL(String SQL){
			this.SQL = SQL;
		}
	   

	   /* This method is called to load entire data from OracleDB as part of initial run */
	   @Override
	public void fetchData(){
		   double totalRecords = jdbcTemplateObject.queryForObject(countSQL, Double.class);
		   System.out.println("Total records are " + totalRecords);
		   int recordsPerThread = (int)Math.ceil(totalRecords/numberOfthreads);
		   int startRow = 0;
		   int endRow = recordsPerThread;
		   ctx = new ClassPathXmlApplicationContext("tree-finder-beans.xml");
		   for(int i=1;i<=numberOfthreads;i++){
			   ReaderThread readerThread = (ReaderThread)ctx.getBean("readerThread");
			   readerThread.setThreadName("Thread-"+i);
			   readerThread.setSQL(SQL + " where rn>" + startRow + " and rn<=" + endRow);
			   readerThread.start();
			   synchronized(readerThread){
		            try{
		                System.out.println("Waiting for Thread-"+i + " to complete...");
		                readerThread.wait();
		            }catch(InterruptedException e){
		                e.printStackTrace();
		            }
			   }
			   startRow = endRow;
			   endRow = (endRow + recordsPerThread > (int)totalRecords)?(int)totalRecords:(endRow + recordsPerThread);
		   }
	}
	   
	   /* This method is called to load subsequent(after initial run) data from OracleDB*/
	   @Override
	   public void fetchData(String date){
		   ctx = new ClassPathXmlApplicationContext("tree-finder-beans.xml");
		   ReaderThread readerThread = (ReaderThread)ctx.getBean("readerThread");
		   readerThread.setThreadName("Thread-1");
		   readerThread.setSQL(SQL + " where TO_CHAR(modify_date) > '" + date + "'");
		   readerThread.start();
		   synchronized(readerThread){
	            try{
	                System.out.println("Waiting for Thread-1 to complete...");
	                readerThread.wait();
	            }catch(InterruptedException e){
	                e.printStackTrace();
	            }
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

