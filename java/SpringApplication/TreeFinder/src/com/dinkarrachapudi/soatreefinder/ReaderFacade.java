package com.dinkarrachapudi.soatreefinder;

public class ReaderFacade {
	IReader reader;
	String SQL;
	
	 public void setReader(IReader reader) {
	      this.reader = reader;
	   }
	 
	 public IReader getReader() {
	      return reader;
	   }
	 
	 public void setSQL(String SQL){
		 this.SQL = SQL;
	 }
	 
	 public String getSQL(){
		 return SQL;
	 }
	
	 
	 public void readData(){
		 reader.fetchData(SQL);
		 System.out.println("CSV write complete");
	 }
}
