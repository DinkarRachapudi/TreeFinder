![alt tag](https://github.com/DinkarRachapudi/DinkarRachapudi.github.io/blob/master/img/TreeFinderHome.jpg)

##Introduction

TreeFinder is a web application built using the MEAN stack to serve as an 
alternative web console for Oracle BPEL 11g applications and alleviates any load on the BPEL engine resulting from console access by having a separate database for handling console based queries and letting the BPEL engine do its job of processing requests. TreeFinder provides faster access to the process instances with a simple user interface for searching and gets its data from MongoDB after a java batch process extracts the data from Oracle BPEL engine's database and loads it into MongoDB.


##Features
1. Simplified one stop search for searching BPEL instances by Instance Id, Title and Process Name.
2. [TreeView](https://raw.githubusercontent.com/DinkarRachapudi/DinkarRachapudi.github.io/master/img/TreeView.jpg) showing end to end lifecycle of processes - similar to the Flowtrace view.
3. Fast Title (Name) based search.
4. Consolidated one stop search for multiple process (composite) revisions.


##System Architecture

![alt tag](https://github.com/DinkarRachapudi/DinkarRachapudi.github.io/blob/master/img/System%20Architecture%20-Spring%20Integration.jpg?raw=true)


##Setting up the Project

1.	Checkout the project from GitHub.
2.	Set up Mongo DB. 
  1. Download and install MongoDB.
  2. Add mongodb bin directory (folder containing mongo.exe) to the path variable if not present.
  3. Create directory 'data/db' under C drive.
  4. Run mongod.exe from installation directory. MongoDB starts up.
  5. In a terminal window, enter 'mongo' to start the mongo shell. Type 'use soainfra' to switch to soainfra database. soainfra is the database that will be used by the application.
  6. At the screen which shows 'switched to db soainfra', create a user by running the following command - db.createUser({user:YourUserName,pwd:YourPassword,roles:[]}). Successfully added user message is displayed.
  7. Enter the above user name and password into the placeholders in credentails.js file.
3.	Download and install Node.js. Make sure nodejs installation directory is included in the path variable.
4.	Edit tree-finder-beans.xml - Enter Oracle BPEL Engine Database parameters for bean 'BPELDataSource'. Optionally, configure the number of parallel threads in the 'reader' bean. This value comes into play only when the initialRun parameter on the readerFacade bean is set to 'Y'. More on the initialRun parameter is explained in step 6. 
5.	Edit main.handlebars and home.handlebars - Enter SOA server host/port, weblogic domain name and SOA server name in the angle bracket place holders. Don't forget to remove the angle brackets.
6.	Run loadMongo.bat file to load the data into MongoDB after setting one of the two options below.
    1. If the data from BPEL engine tables is being extracted for the first time, set the initialRun parameter on the readerFacade bean to 'Y'. This indicates the java process to fetch entire records from Oracle BPEL engine tables. Multiple threads (depending on the numberOfthreads parameter in the reader bean and the total count of records) are spawned to extract the data. It is suggested to perform the initial run when there are enough system resources at disposal as the data loading process can take several hours depending on the volume.
    2. For subsequent data extraction from Oracle BPEL Engine tables after the initial loading is successful, set the initialRun parameter on the readerFacade bean to 'N'.
7.	CD to the project directory from a terminal and run 'node server.js'. Make sure 'MongoDB connection established' message is displayed. 
8.	Fire up a browser and navigate to http://hostName:3000 (where hostName is the name of the computer/server where the app is running) to start searching.

