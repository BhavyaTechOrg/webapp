# webapp

## Assignment 3

### AWS CLI Installation and Configuration (Windows)
1. Install AWS CLI
Download & Install: AWS CLI Installer

## Verify Installation:
Open Command Prompt or PowerShell and run : aws --version
1. Create IAM User & Group (Least Privilege)
In AWS IAM Console:

* Create Group (e.g., LimitedAccessGroup)
* Attach specific permissions instead of AdministratorAccess.

Create User:
* Select Programmatic access.
* Add user to the LimitedAccessGroup.
* Download .csv file with Access Key ID & Secret.

3. Configure AWS CLI
* Run in Command Prompt: aws configure --profile [your profile name]
Enter:
* Access Key ID
* Secret Access Key
* Region (e.g., us-east-1)
* Output format (json, text, table)

1. Test Setup
* aws sts get-caller-identity --profile [your profile name]
If successful, it returns IAM user details.

2. Security Best Practices
* Never use Admin access for CLI users.
* Keep credentials secure (avoid hardcoding).
* Use IAM roles when possible.


### Terraform CI/CD Setup

This repository automates AWS networking infrastructure setup using Terraform and enforces CI/CD via GitHub Actions

## Setup Instructions
1. Pre-requisites
Terraform v1.10.5+
AWS CLI (Configured with dev and demo profiles)
GitHub CLI (Optional)

## 2. Clone, Initialize, Deploy and Destroy Infrastructure
* terraform init
* terraform plan -var-file="dev.tfvars"
* tterraform apply -var-file="dev.tfvars"
* terraform destroy -var-file="dev.tfvars"

## CI/CD Workflow

The GitHub Actions pipeline runs on pull requests to main and performs:
* Terraform Format Check (terraform fmt)
* Terraform Validation (terraform validate)
* Blocks merging if validation fails
* Uploads logs on failure

## Troubleshooting
CI failures? Check logs in GitHub Actions
Terraform issues? Run locally

* terraform fmt -recursive
* terraform validate


## Assignment 2 - Based Web Application Setup 

Objective - In this assignment, you will set up an AWS organization, configure IAM policies, and automate the deployment of a web application using a shell script. Additionally, you will implement API testing for your web application

### 1. AWS Organization Setup
Enable AWS Organizations in your root AWS account.
Create two member accounts:
Development Account (dev) for assignment development.
Demo Account (demo) for demonstrating assignments.
Use email aliases like yourname+dev@gmail.com and yourname+demo@gmail.com

### 2. AWS IAM Setup
#### 2.1 IAM Group Creation
Create an IAM Group called csye6225-ta for Teaching Assistants (TAs).
Assign the ReadOnlyAccess AWS-managed policy (arn:aws:iam::aws:policy/ReadOnlyAccess) to the group.

#### 2.2 IAM User Creation
Create IAM users for each TA, using their first name as the username.
AWS will generate a temporary password (not emailed automatically).
Manually share the credentials with the respective users.

### 3. Automating Application Setup with a Shell Script
A shell script (script.sh) will automate the deployment of a web application on Ubuntu 24.04 LTS. The script should:

Update the system packages.
Upgrade installed packages.
Install PostgreSQL (or MySQL/MariaDB).
Create a database in the chosen RDBMS.
Create a Linux group for the application.
Create a Linux user for the application.
Unzip the application in the /opt/csye6225 directory.
Update permissions for the application files.
The script.sh file for these steps is included in the repository.

### 4. API Testing Implementation
You must implement API tests using a testing framework (e.g., Jest for JavaScript, REST Assured for Java). The test suite should:

Validate API success and failure scenarios.
Cover edge cases for the /healthz endpoint.
Ensure that incorrect HTTP methods return appropriate 405 Method Not Allowed responses.

The test files should be stored in a separate tests directory inside your repository.


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


