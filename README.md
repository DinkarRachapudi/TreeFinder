Introduction

TreeFinder is a web application built using the MEAN stack to serve as an 
alternative web console for Oracle BPEL 11g applications and alleviate any
load on the BPEL engine due to console access by having a separate database for handling 
console based queries and letting the BPEL engine do 
it's stuff of processing requests. TreeFinder provides faster 
access to the process instances with a simple user interface for searching and
gets it's data from MongoDB after a java batch process extracts 
the data from Oracle BPEL engine's database and loads it into MongoDB.


System Architecture

See https://drive.google.com/file/d/0B07MCddG9ynCZkZYOVNXT01JZHc/view?usp=sharing


System Requirements

1. Computer/Server with Windows OS and Java JDK
2. MongoDB
3. Node.js


Setting up the Project

A video on how to set up the project is available at the below link

Steps:
1. Checkout the project from GitHub
2. Install Mongo DB 
3. Install Node.js
4. Edit context.properties - Enter Oracle BPEL Engine Database parameters and MongoDB parameters in the angle bracket place holders.
5. Edit credentials.js - Enter MongoDB connection parameters in the angle bracket place holders
6. Edit main.handlebars and home.handlebars - Enter SOA server host/port, weblogic domain name and SOA server name in the angle bracket place holders.
7. CD to the project directory and run 'node server.js'
