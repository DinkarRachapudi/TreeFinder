![alt tag](https://github.com/DinkarRachapudi/DinkarRachapudi.github.io/blob/master/img/TreeFinderHome.jpg)

##Introduction

TreeFinder is a web application built using the MEAN stack to serve as an 
alternative web console for Oracle BPEL 11g applications and alleviates any load on the BPEL engine resulting from console access by having a separate database for handling console based queries and letting the BPEL engine do its job of processing requests. TreeFinder provides faster access to the process instances with a simple user interface for searching and gets its data from MongoDB after a java batch process extracts the data from Oracle BPEL engine's database and loads it into MongoDB.


##System Architecture

![alt tag](https://github.com/DinkarRachapudi/DinkarRachapudi.github.io/blob/master/img/System%20Architecture.jpg?raw=true)


##Prerequisites

1. Computer/Server with Windows OS and Java JDK


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
4.	Edit context.properties - Enter Oracle BPEL Engine Database parameters in the angle bracket place holders.
5.	Edit main.handlebars and home.handlebars - Enter SOA server host/port, weblogic domain name and SOA server name in the angle bracket place holders. Don't forget to remove the angle brackets.
6.	Run daily.bat (to load yesterday's data) or batch.bat (to load data within a specific date range). This will load data into the MongoDB from the BPEL engine tables.
7.	CD to the project directory from a terminal and run 'node server.js'. Make sure 'MongoDB connection established' message is displayed. 
8.	Fire up a browser and navigate to http://localhost:3000 to start searching.

