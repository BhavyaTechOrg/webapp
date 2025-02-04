#!/bin/bash

#!/bin/bash

# Update and upgrade packages
echo "Updating and upgrading system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install PostgreSQL (replace with MySQL or MariaDB if needed)
echo "Installing PostgreSQL..."
sudo apt-get install postgresql postgresql-contrib -y

# Create a database
echo "Creating database 'csye6225db'..."
sudo -u postgres psql -c "CREATE DATABASE csye6225db;"

# Create a Linux group and user
echo "Creating Bhavya_RaghunathaReddy_002415278_01 group and user..."
sudo groupadd csye6225group
sudo useradd -m -g csye6225group -s /bin/bash csye6225user

# Unzip the Bhavya_RaghunathaReddy_002415278_01 to /opt/csye6225
echo "Unzipping Bhavya_RaghunathaReddy_002415278_01..."
sudo mkdir -p /opt/csye6225
sudo mv /path/to/Bhavya_RaghunathaReddy_002415278_01.zip /opt/csye6225/
sudo apt-get install unzip -y
sudo unzip /opt/csye6225/Bhavya_RaghunathaReddy_002415278_01.zip -d /opt/csye6225

# Update permissions
echo "Updating permissions..."
sudo chown -R csye6225user:csye6225group /opt/csye6225
sudo chmod -R 750 /opt/csye6225

echo "Setup complete!" 