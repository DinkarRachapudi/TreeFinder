package com.dinkarrachapudi.soatreefinder;



import java.io.FileWriter;
import java.io.IOException;
import javax.sql.DataSource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.jdbc.support.rowset.SqlRowSetMetaData;

public class OracleDBReader implements IReader{
	
	   private DataSource dataSource;
	   private JdbcTemplate jdbcTemplateObject;
	   RowCallbackHandler rcbHandler;
	   private String filePath;
	   private FileWriter fileWriter;
	   private int recordsPerBatch;
	   private String countSQL;
	   private String columnsSQL;
	   
	   public void setDataSource(DataSource dataSource) {
		      this.dataSource = dataSource;
		      this.jdbcTemplateObject = new JdbcTemplate(dataSource);
		   }
	   
	   public void setFilePath(String filePath) {
		      this.filePath = filePath;
		      System.out.println("Writing to " + filePath);
		   }
	   
	   public void setRecordsPerBatch(int recordsPerBatch){
		   this.recordsPerBatch = recordsPerBatch;
	   }
	   
	   public void setCountSQL(String countSQL){
		   this.countSQL = countSQL;
	   }
	   
	   public void setColumnsSQL(String columnsSQL){
		   this.columnsSQL = columnsSQL;
	   }
	  

	   @Override
	public void fetchData(String SQL){
		   int totalRecords = jdbcTemplateObject.queryForObject(countSQL, Integer.class);
		   System.out.println("Total records are " + totalRecords);
		   int startRow = 0;
		   int endRow = recordsPerBatch;
		   try{
		   SqlRowSetMetaData cubeCompositeMetadata = jdbcTemplateObject.queryForRowSet(columnsSQL).getMetaData();
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
		   
		   
		   while(totalRecords>startRow){
			   System.out.println("Executing SQL " + SQL + " where rn>" + startRow + " and rn<=" + endRow);
			   fileWriter = new FileWriter(filePath,true);
			   rcbHandler = new CSVWriter(fileWriter);
			   jdbcTemplateObject.query(SQL + " where rn>" + startRow + " and rn<=" + endRow, rcbHandler);
			   System.out.println("Completed CSVWrite for SQL " + SQL + " where rn>" + startRow + " and rn<=" + endRow);
			   startRow = startRow + recordsPerBatch;
			   endRow = startRow + recordsPerBatch;
		   }
		   }
		   catch(IOException e) {
			   System.out.println("IOException: " + e);
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

