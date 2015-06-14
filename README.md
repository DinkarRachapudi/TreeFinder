![alt tag](https://github.com/DinkarRachapudi/DinkarRachapudi.github.io/blob/master/img/TreeFinderHome.jpg)

##Introduction

TreeFinder is a web application built using the MEAN stack to serve as an 
alternative web console for Oracle BPEL 11g applications and alleviates any load on the BPEL engine resulting from console access by having a separate database for handling console based queries and letting the BPEL engine do its job of processing requests. TreeFinder provides faster access to the process instances with a simple user interface for searching and gets its data from MongoDB after a java batch process extracts the data from Oracle BPEL engine's database and loads it into MongoDB.


##System Architecture

See https://drive.google.com/file/d/0B07MCddG9ynCZkZYOVNXT01JZHc/view?usp=sharing


##Prerequisites

1. Computer/Server with Windows OS and Java JDK


##Setting up the Project

1.	Checkout the project from GitHub.
2.	Download and install Mongo DB. Create a user from mongo shell. These credentials will go in credentails.js in step # 5
3.	Download and install Node.js
4.	Edit context.properties - Enter Oracle BPEL Engine Database parameters and MongoDB parameters in the angle bracket place holders.
5.	Edit credentials.js - Enter MongoDB connection parameters in the angle bracket place holders.
6.	Edit main.handlebars and home.handlebars - Enter SOA server host/port, weblogic domain name and SOA server name in the angle bracket place holders.
7.	CD to the project directory and run 'node server.js'

