# webapp

# Cloud Native Web Application - Assignment 05

## Overview

This repository contains my implementation of Assignment 05 for the Cloud Computing course. I've automated the deployment of a cloud-native web application with RDS database integration and S3 file storage capabilities.

## Implementation Details

### Infrastructure as Code (Terraform)

I've implemented the following resources using Terraform:

- **VPC and Networking**: Reused my previous Terraform configuration for VPC, subnets, and route tables
- **S3 Bucket**: 
  - Created a private bucket with UUID-based name
  - Enabled default encryption
  - Configured lifecycle policy for STANDARD to STANDARD_IA transition after 30 days
  - Added bucket policy for secure access

- **IAM Roles**:
  - Created EC2 instance profile with S3 access permissions
  - Implemented least privilege principle with specific policies

- **Security Groups**:
  - Application security group for web traffic
  - Database security group allowing traffic only from application security group

- **RDS Configuration**:
  - Custom parameter group for MySQL 8.0
  - DB instance in private subnet with appropriate specifications
  - Secured with proper credentials and no public access

### AMI Updates (Packer)

Modified my Packer template to:
- Remove local database installation
- Configure SystemD service for auto-start
- Create dedicated non-privileged application user
- Set proper file permissions

### Web Application Updates

Updated my web application to:
- Read database configuration from user data
- Connect to RDS instance for data persistence
- Implement file upload/retrieval APIs using S3
- Store file metadata in RDS
- Handle proper error responses and edge cases

### How to Deploy

1. Build the AMI using Packer:
   ```
   cd packer
   packer build ami.json
   ```

2. Deploy infrastructure using Terraform:
   ```
   cd terraform
   terraform init
   terraform apply
   ```

3. The application will automatically start on EC2 instance launch

### Testing the Application

I've tested the following functionality:
- Health check endpoint returns 200 OK
- File upload to S3 with proper metadata storage
- File metadata retrieval
- File deletion from both S3 and database
- Application auto-start after EC2 reboot

## Assignment 4

### Custom Machine Images & CI/CD with Packer, Terraform, and Cloud Integration

## Objective:

* Build custom application images (with a local DB installation) using Ubuntu 24.04 LTS.
* Automate image builds via Packer and integrate CI/CD with GitHub Actions.

### Key Requirements:

### Custom Image Creation:

* Use Ubuntu 24.04 LTS as the source image.
* Include all necessary application dependencies (e.g., Java/Tomcat or Python libraries) and a local database (MySQL/MariaDB/PostgreSQL).
* Ensure that the custom images remain private and are built within your DEV AWS account and DEV GCP Project.
* Build images within your default VPC.

### GitHub Actions Workflows:

* PR Triggers: Run packer fmt and packer validate on pull requests to enforce proper formatting and configuration, blocking merges if issues are detected.
* Post-Merge Workflow: Trigger a workflow to build custom images in AWS and GCP in parallel (artifact is built on the Actions runner and then copied into the image).
* Configure systemd to auto-start your application on instance launch, ensuring that application artifacts and configuration files are correctly owned by the non-login user/group csye6225.

### Terraform & Infrastructure:

* Update Terraform templates to create an EC2 security group allowing ingress on ports 22, 80, 443, and the port on which your application runs.
* Launch an EC2 instance using your custom AMI in a non-default VPC, with EBS volumes set to terminate upon instance termination.

### GCP

* Launch a Compute Engine instance from the custom machine image (ensuring that API endpoints are accessible and database connectivity can be verified).

### Commands to Run in your local machine

* Make sure to pass the env before you run 
* Replace your postgress username, password and ami_id

$env:PKR_VAR_POSTGRES_USER="yourusername"
$env:PKR_VAR_POSTGRES_PASSWORD="password"
$env:PKR_VAR_ami_id="ami-ID"

packer fmt -check packer
packer init packer
packer validate packer


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


