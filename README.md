# webapp
## Assignment 2 


## Assignment 1: Building a Basic API with Node.js, Express, Sequelize, and PostgreSQL

In this assignment, the objective is to develop a basic API to verify the connection to a local database. The project employs Node.js, Express, Sequelize, and PostgreSQL to demonstrate the necessary functionality.

## Features
The API includes a `/healthz` endpoint designed to perform a database connection test.

To start the database server, use the Postgres desktop app.

To verify the connection status, you can use the following `curl` request:

GET request: curl -vvvv http://localhost:3000/healthz

This request will return either "OK" or "Service Unavailable" depending on connection status.

## Other HTTP Methods
The /healthz endpoint has been secured by middleware to allow only specific HTTP methods.

To test this middleware, you can use the following curl requests:

PUT request: curl -vvvv -X PUT http://localhost:3000/healthz

POST request: curl -vvvv -X POST http://localhost:3000/healthz

DELETE request: curl -vvvv -X DELETE http://localhost:3000/healthz

PATCH request: curl -vvvv -X PATCH http://localhost:3000/healthz

## Setup
1. Clone the Repository - https://github.com/BhavyaTechOrg/webapp.git
2. Install Dependencies - npm install
3. Configure Environment Variables
   Create a .env file in the root directory and add the following environment variables:
   1. POSTGRESQL_DB= YOUR DB NAME
   2. POSTGRESQL_USER=USERNAME
   3. POSTGRESQL_PASSWORD=PASSWORD
   4. POSTGRESQL_HOST=localhost
   5. PORT=3000
4. Start the Application - npm start


