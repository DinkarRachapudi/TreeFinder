package com.dinkarrachapudi.soatreefinder;


import javax.sql.DataSource;
import org.springframework.jdbc.core.JdbcTemplate;

public class BPELJdbcTemplate {
		private DataSource dataSource;
	   private JdbcTemplate jdbcTemplateObject;
	   
	   public void setDataSource(DataSource dataSource) {
		      this.dataSource = dataSource;
		      this.jdbcTemplateObject = new JdbcTemplate(dataSource);
		   }
	   
	   public int getCubeCount() {
		      String SQL = "select count(*) from cube_instance";
		      int cubeCount = jdbcTemplateObject.queryForObject(SQL, Integer.class);
		      return cubeCount;
		   }
}
