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
	   
	   public void setDataSource(DataSource dataSource) {
		      this.dataSource = dataSource;
		      this.jdbcTemplateObject = new JdbcTemplate(dataSource);
		   }
	   
	   public void setFilePath(String filePath) {
		      this.filePath = filePath;
		      try{
		    	  this.fileWriter = new FileWriter(filePath,false);
		    	  this.rcbHandler = new CSVWriter(fileWriter);
				   }
				   catch(IOException e){
					   
				   }
		      System.out.println("Writing to " + filePath);
		   }

	   @Override
	public void fetchData(String SQL){
		   try{
		   SqlRowSetMetaData cubeCompositeMetadata = jdbcTemplateObject.queryForRowSet(SQL).getMetaData();
		   for(int i=1;i<=cubeCompositeMetadata.getColumnCount();i++){
			   fileWriter.append(cubeCompositeMetadata.getColumnName(i));
			   if(i==cubeCompositeMetadata.getColumnCount())
				   fileWriter.append("\n");
			   else{
				   fileWriter.append(",");
			   }
		   }
		   }
		   catch(IOException e) {
			   System.out.println("IOException: " + e);
		   }
		   System.out.println("Executing SQL " + SQL);
	      jdbcTemplateObject.query(SQL,rcbHandler);
	      
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

