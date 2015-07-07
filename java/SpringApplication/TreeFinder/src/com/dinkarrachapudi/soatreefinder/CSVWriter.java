package com.dinkarrachapudi.soatreefinder;

import java.io.FileWriter;
import java.io.IOException;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;

import org.springframework.jdbc.core.RowCallbackHandler;

public class CSVWriter implements RowCallbackHandler{
	
	FileWriter fileWriter;
	
	public CSVWriter(FileWriter fileWriter){
		this.fileWriter = fileWriter;
	}
	
	
	public void processRow(ResultSet rs){
		try{
		ResultSetMetaData rsmd = rs.getMetaData();
		
		for(int i=1;i<=rsmd.getColumnCount();i++){
            /* The following block of switch statement checks for the sql data type of
            a given column and writes the column value into the csv file*/
            switch (rsmd.getColumnType(i)) {
            
                case 12:
                	fileWriter.append(rs.getString(i));
                break;
                case -9:
                	fileWriter.append(rs.getString(i));
                break;
                case -15:
                	fileWriter.append(rs.getString(i));
                break;
                case 16:
                	fileWriter.append(String.valueOf(rs.getBoolean(i)));
                break;
                case -7:
                	fileWriter.append(String.valueOf(rs.getByte(i)));
                break;
                case 2:
                	fileWriter.append(String.valueOf(rs.getInt(i)));
                break;
                case 4:
                	fileWriter.append(String.valueOf(rs.getInt(i)));
                break;
                case 6:
                	fileWriter.append(String.valueOf(rs.getFloat(i)));
                break;
                case 8:
                	fileWriter.append(String.valueOf(rs.getDouble(i)));
                break;
                case 3:
                	fileWriter.append(String.valueOf(rs.getBigDecimal(i)));
                break;
                case 1:
                	fileWriter.append(rs.getString(i));
                break;
                case 91:
                	fileWriter.append(rs.getDate(i).toString());
                break;
                case 92:
                	fileWriter.append(rs.getTime(i).toString());
                break;
                case 93:
                	fileWriter.append(rs.getTimestamp(i).toString());
                break;
                default:
                	fileWriter.append(rs.getString(i));
} 
           
            if(i!=rsmd.getColumnCount())
            fileWriter.append(",");
			}
		
			
			fileWriter.append("\n");
			fileWriter.flush();	
			
		}
			catch(IOException e){
				System.out.println("IOException: " + e);
			}
			catch(SQLException e){
				System.out.println("SQLException: " + e);
			}
            
        
}
}
