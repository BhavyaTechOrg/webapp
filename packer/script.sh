#!/bin/bash

# Update and upgrade packages
echo "Updating and upgrading system packages"
sudo apt-get update
sudo apt-get upgrade -y

# Install PostgreSQL, unzip, npm and nodejs
echo "PostgreSQL Installation"
sudo apt-get install postgresql postgresql-contrib -y unzip npm nodejs

# Server running
echo "Postgres is running"
sudo systemctl enable postgresql
sudo systemctl start postgresql
sudo systemctl status postgresql --no-pager

#checking for db configuration

read -rsp "enter database password: " DB_PASSWORD
echo

if [ -z "$DB_PASSWORD" ]; then
  echo "please enter the password"
  exit 1
fi

#configuring the database 

echo "CONFIGURING DATABASE"

sudo -u postgres psql <<EOF

ALTER USER postgres WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE postgres TO postgres;
ALTER USER postgres WITH SUPERUSER;
EOF

# Create a healthcheck_db database
echo "Creating database 'healthcheck_db'..."
sudo -u postgres psql -c "CREATE DATABASE healthcheck_db;"

USER="bhavya"
# Create a Linux group and user
echo "Creating application group and user..."
sudo groupadd healthcheck_group
sudo useradd -m -g healthcheck_group -s /bin/bash $USER

echo "Unzipping application..."
sudo mkdir -p "/opt/csye6225"
sudo unzip -o "/tmp/Bhavya_RaghunathaReddy_002415278_02.zip" -d "/opt/csye6225"

# Update permissions
echo "Updating permissions..."
sudo chown -R $USER:healthcheck_group /opt/csye6225
sudo chmod -R 750 /opt/csye6225

# Initialize a new Node.js project
echo "Initializing Node.js project..."
cd /opt/csye6225/Bhavya_RaghunathaReddy_002415278_02/webapp
npm install

echo "Setup completed"

