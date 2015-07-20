package com.dinkarrachapudi.soatreefinder;

import java.io.FileWriter;
import java.io.IOException;
import javax.sql.DataSource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.jdbc.support.rowset.SqlRowSetMetaData;

public class ReaderThread implements Runnable{
	Thread t;
	RowCallbackHandler rcbHandler;
	String filePath;
	FileWriter fileWriter;
	JdbcTemplate jdbcTemplateObject;
	DataSource dataSource;
	String folderPath;
	int recordsPerBatch;
	String SQL;
	String columnsSQL;
	String threadName;
	int startRow;
	int endRow;
	

	public void setDataSource(DataSource dataSource) {
		this.dataSource = dataSource;
		this.jdbcTemplateObject = new JdbcTemplate(dataSource);
	}

	public void setFolderPath(String folderPath) {
		this.folderPath = folderPath;
	}

	public void setRecordsPerBatch(int recordsPerBatch){
		this.recordsPerBatch = recordsPerBatch;
	}

	public void setSQL(String SQL){
		this.SQL = SQL;
	}

	public void setColumnsSQL(String columnsSQL){
		this.columnsSQL = columnsSQL;
	}
	
	public void setThreadName(String threadName){
		this.threadName = threadName;
	}
	
	public void setStartRow(int startRow){
		this.startRow = startRow;
	}
	
	public void setEndRow(int endRow){
		this.endRow = endRow;
	}
	
	
	
	
	public void run(){
		try{   
			SqlRowSetMetaData cubeCompositeMetadata = jdbcTemplateObject.queryForRowSet(columnsSQL).getMetaData();
			filePath = folderPath + "\\cubeComposite_instance-" + threadName + ".csv";
			   FileWriter fileWriter = new FileWriter(filePath,true);
			   for(int i=1;i<=cubeCompositeMetadata.getColumnCount();i++){
				   fileWriter.append(cubeCompositeMetadata.getColumnName(i));
				   if(i==cubeCompositeMetadata.getColumnCount())
					   fileWriter.append("\n");
				   else{
					   fileWriter.append(",");
				   }
			   }
			   fileWriter.flush();
			   fileWriter.close();
			   
			   int batchStartRow = startRow;
			   int batchEndRow;
			   batchEndRow = startRow + recordsPerBatch;
			   if(recordsPerBatch>endRow)
				   batchEndRow=endRow; 
			   while(batchStartRow<endRow){
				   System.out.println(threadName + " Executing SQL " + SQL + " where rn>" + batchStartRow + " and rn<=" + batchEndRow);
				   fileWriter = new FileWriter(filePath,true);
				   rcbHandler = new CSVWriter(fileWriter);
				   jdbcTemplateObject.query(SQL + " where rn>" + batchStartRow + " and rn<=" + batchEndRow, rcbHandler);
				   System.out.println("Completed CSVWrite for SQL " + SQL + " where rn>" + batchStartRow + " and rn<=" + batchEndRow);
				   batchStartRow = batchStartRow + recordsPerBatch;
				   batchEndRow = batchStartRow + recordsPerBatch;
				   if(endRow<batchEndRow)
					   batchEndRow = endRow;
			   }
			   fileWriter.close();
			   String mongoImportCommand = "mongoimport --db soainfra --collection cubeComposite_instance --type csv --headerline --file " + System.getProperty("user.dir") + "\\cubeComposite_instance-" + threadName + ".csv";
			   System.out.println("Executing " + mongoImportCommand);
				Runtime.getRuntime().exec(mongoImportCommand);
				System.out.println("MongoDB import complete for " + threadName);
			   }
			   catch(IOException e) {
				   System.out.println("IOException: " + e);
			   }
		System.out.println("CSVWrite complete for " + filePath);
	}
	
	public void start(){
		if(t == null){
			t = new Thread(this,threadName);
			t.start();
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
