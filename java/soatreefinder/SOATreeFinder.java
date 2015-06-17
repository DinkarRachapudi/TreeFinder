/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package soatreefinder;


import com.mongodb.MongoClient;
import com.mongodb.client.model.UpdateOptions;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import static com.mongodb.client.model.Filters.*;
import com.mongodb.ServerAddress;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.sql.Blob;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import org.apache.log4j.Logger;
import org.apache.log4j.PropertyConfigurator;
import org.bson.Document;

/**
 *
 * @author Dinkar
 */
public class SOATreeFinder {

    /**
     * @param args the command line arguments
     */
    
    final static Logger logger = Logger.getLogger(SOATreeFinder.class);
    static Properties propsFile = new Properties();
    
    
    // The sql queries to fetch the data are prepared in the main method
    public static void main(String[] args){
        PropertyConfigurator.configure(System.getProperty("user.dir") + "\\log4j.properties");
        SimpleDateFormat sdf = new SimpleDateFormat("YYYY/MM/dd");
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DATE, -1); 
	String yesterdaysDate = sdf.format(cal.getTime()); 
        //Setting up sql queries to fetch results from yesterday if no start and end dates are supplied in the input arguments
        String cubeCompositeInstanceQuery = "select cui.CIKEY,cui.CREATION_DATE,cui.MODIFY_DATE,cui.STATE,cui.PRIORITY,cui.TITLE,"
                + "cui.STATUS,cui.ROOT_ID,cui.PARENT_ID,cui.ECID,cui.CMPST_ID,cui.PARENT_REF_ID,cui.COMPONENTTYPE,cui.COMPOSITE_NAME,"
                + "cui.DOMAIN_NAME,cui.COMPONENT_NAME,cui.COMPOSITE_REVISION,cui.CPST_INST_CREATED_TIME,coi.TITLE as COMPTITLE"
                + " from cube_instance cui, composite_instance coi where cui.cmpst_id=coi.id and "
                + "TO_CHAR(cui.MODIFY_DATE,'YYYY/MM/DD') ='" + yesterdaysDate +"'";
        String payloadQuery = "select xd.DOCUMENT_ID, xd.DOCUMENT, cui.* from xml_document xd, DOCUMENT_DLV_MSG_REF dr, dlv_message dm, cube_instance cui where xd.DOCUMENT_ID=dr.DOCUMENT_ID and dr.MESSAGE_GUID=dm.MESSAGE_GUID and dm.CONV_ID=cui.CONVERSATION_ID and TO_CHAR(cui.MODIFY_DATE,'YYYY/MM/DD') ='" + yesterdaysDate +"'";
        
       
        // update sql queries if arguments are supplied
        if(args.length==2 && args[0]!=null && args[1]!=null){
               cubeCompositeInstanceQuery="select cui.CIKEY,cui.CREATION_DATE,cui.MODIFY_DATE,cui.STATE,cui.PRIORITY,cui.TITLE,"
                + "cui.STATUS,cui.ROOT_ID,cui.PARENT_ID,cui.ECID,cui.CMPST_ID,cui.PARENT_REF_ID,cui.COMPONENTTYPE,cui.COMPOSITE_NAME,"
                + "cui.DOMAIN_NAME,cui.COMPONENT_NAME,cui.COMPOSITE_REVISION,cui.CPST_INST_CREATED_TIME,coi.TITLE as COMPTITLE"
                + " from cube_instance cui, composite_instance coi where cui.cmpst_id=coi.id and  "
                       + "cui.modify_date > TO_DATE('" + args[0] + "', 'YYYY/MM/DD') and cui.modify_date < TO_DATE('" + args[1] + "', 'YYYY/MM/DD')";
               payloadQuery="select xd.DOCUMENT_ID, xd.DOCUMENT, cui.* from xml_document xd, DOCUMENT_DLV_MSG_REF dr, dlv_message dm, cube_instance cui where xd.DOCUMENT_ID=dr.DOCUMENT_ID and dr.MESSAGE_GUID=dm.MESSAGE_GUID and dm.CONV_ID=cui.CONVERSATION_ID and cui.modify_date > TO_DATE('" + args[0] + "', 'YYYY/MM/DD') and cui.modify_date < TO_DATE('" + args[1] + "', 'YYYY/MM/DD')";     
            }
        try{
            
    loadMongoFromSQL(cubeCompositeInstanceQuery,"soainfra","cubeComposite_instance","CIKEY");
    System.out.println("composite  query:" + cubeCompositeInstanceQuery);
    logger.info("Completed " + cubeCompositeInstanceQuery);
    //loadMongoFromSQL(payloadQuery,"soainfra","xml_document","DOCUMENT_ID");
    //System.out.println("payload query:" + payloadQuery);
    //logger.info("Completed " + payloadQuery);
            
        }
        catch(FileNotFoundException e){
            logger.error("FileNotFoundException : " + e.getStackTrace() + ": " + e.getMessage());
            System.out.println("FileNotFoundException: " + e);
        }
        catch(IOException e){
            logger.error("IOException : " + e.getStackTrace() + ": " + e.getMessage());
            System.out.println("IOException: " + e);
        }
        catch(SQLException e){
            logger.error("SQLException : " + e.getStackTrace() + ": " + e.getMessage());
            System.out.println("SQLException: " + e);
        }
    
    }
    
    
    //This generic method loads the results of any sql query supplied to it into the mongo collection
    public static void loadMongoFromSQL(String sqlQuery, String mongoDBName, String mongoCollName, String mongoCollPrimaryKey) throws SQLException, IOException, FileNotFoundException{
     propsFile.load(new FileInputStream(System.getProperty("user.dir") + "\\context.properties"));
     Statement stmt = null;
     String blobString;
     Map sqlMap = new HashMap();
     MongoClient mongoClient = new MongoClient(Arrays.asList(new ServerAddress(propsFile.getProperty("mongoHost"), Integer.parseInt(propsFile.getProperty("mongoPort")))));
     MongoDatabase db = mongoClient.getDatabase(mongoDBName);
     MongoCollection coll = db.getCollection(mongoCollName);
     UpdateOptions upsertOption = new UpdateOptions();
     upsertOption.upsert(true);
    Connection soadb_Connection = DriverManager.getConnection(
        "jdbc:oracle:thin:" + propsFile.getProperty("user") + "/" + propsFile.getProperty("password") + "@//" +  propsFile.getProperty("host") + ":" + propsFile.getProperty("port") + "/" + propsFile.getProperty("service"));
        
        stmt = soadb_Connection.createStatement();
        ResultSet rs = stmt.executeQuery(sqlQuery);
        ResultSetMetaData rsmd = rs.getMetaData();
        while (rs.next()) {
            for(int i=1;i<=rsmd.getColumnCount();i++){
                /* The following block of switch statement checks for the sql data type of
                a given column and puts the appropriate object into the hash map*/
                switch (rsmd.getColumnType(i)) {
                    case 12:
                    sqlMap.put(rsmd.getColumnName(i),rs.getString(i));
                    break;
                    case -9:
                    sqlMap.put(rsmd.getColumnName(i),rs.getString(i));
                    break;
                    case -15:
                    sqlMap.put(rsmd.getColumnName(i),rs.getString(i));
                    break;
                    case 16:
                    sqlMap.put(rsmd.getColumnName(i),rs.getBoolean(i));
                    break;
                    case -7:
                    sqlMap.put(rsmd.getColumnName(i),rs.getByte(i));
                    break;
                    case 2:
                    sqlMap.put(rsmd.getColumnName(i),rs.getInt(i));
                    break;
                    case 4:
                    sqlMap.put(rsmd.getColumnName(i),rs.getInt(i));
                    break;
                    case 6:
                    sqlMap.put(rsmd.getColumnName(i),rs.getFloat(i));
                    break;
                    case 8:
                    sqlMap.put(rsmd.getColumnName(i),rs.getDouble(i));
                    break;
                    case 3:
                    sqlMap.put(rsmd.getColumnName(i),rs.getBigDecimal(i));
                    break;
                    case 1:
                    sqlMap.put(rsmd.getColumnName(i),rs.getString(i));
                    break;
                    case 91:
                    sqlMap.put(rsmd.getColumnName(i),rs.getDate(i).toString());
                    break;
                    case 92:
                    sqlMap.put(rsmd.getColumnName(i),rs.getTime(i).toString());
                    break;
                    case 93:
                    sqlMap.put(rsmd.getColumnName(i),rs.getTimestamp(i).toString());
                    break;
                    case 2003:
                    sqlMap.put(rsmd.getColumnName(i),rs.getArray(i));
                    break;
                    case 2004:{
                    Blob blob = rs.getBlob(i);
                    byte[] bdata = blob.getBytes(1, (int) blob.length());
                    blobString = new String(bdata);
                    sqlMap.put(rsmd.getColumnName(i),blobString);
                    }
                    break;
                    case 2005:
                    sqlMap.put(rsmd.getColumnName(i),rs.getClob(i));
                    break;
                    default:
                    sqlMap.put(rsmd.getColumnName(i),rs.getString(i));
} 
            }
            
            // Upsert sql record into mongo collection
            coll.updateOne(eq(mongoCollPrimaryKey, sqlMap.get(mongoCollPrimaryKey)), new Document("$set", new Document(sqlMap)), upsertOption);
        }
    }
    
 }
    
