provisioner "shell" {
  inline = [
    "set -e",
    "echo 'Updating system packages...'",
    "sudo apt-get update",
    "echo 'Installing dependencies...'",
    "sudo apt-get install -y unzip nodejs npm postgresql postgresql-contrib",

    # Ensure PostgreSQL is running and configured
    "echo 'Starting PostgreSQL service...'",
    "sudo systemctl enable postgresql",
    "sudo systemctl restart postgresql",
    "echo 'Creating PostgreSQL database and user...'",
    "sudo -u postgres psql -c \"CREATE DATABASE webapp;\"",
    "sudo -u postgres psql -c \"CREATE USER ${var.POSTGRES_USER} WITH ENCRYPTED PASSWORD '${var.POSTGRES_PASSWORD}';\"",
    "sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE webapp TO ${var.POSTGRES_USER};\"",
    "sudo -u postgres psql -c \"ALTER DATABASE webapp OWNER TO ${var.POSTGRES_USER};\"",
    "sudo systemctl restart postgresql",

    # Extract application & install dependencies
    "echo 'Extracting application files...'",
    "sudo unzip /tmp/webapp.zip -d /opt/webapp/",
    "pwd", # To determine what the working directory is.
    "cd /opt/webapp",  # Explicitly change working directory
    "sudo npm install", # npm install in the webapp directory.
    "sudo groupadd csye6225",
    "sudo useradd --system -g csye6225 csye6225",
    "sudo chown -R csye6225:csye6225 /opt/webapp",

    # Setup systemd service
    "echo 'Configuring systemd service...'",
    "sudo cp /tmp/systemd.service /etc/systemd/system/webapp.service",
    "sudo chmod 644 /etc/systemd/system/webapp.service",
    "sudo systemctl daemon-reload",
    "sudo systemctl enable webapp.service",
    "sudo systemctl start webapp.service",

    # Validate services are running
    "sudo systemctl is-active --quiet postgresql || exit 1",
    "sudo systemctl is-active --quiet webapp.service || exit 1"
  ]
  environment_vars = [
    "NODE_ENV=production",
    "PORT=3000",
    "POSTGRES_DB=webapp",
    "POSTGRES_USER=${var.POSTGRES_USER}",
    "POSTGRES_PASSWORD=${var.POSTGRES_PASSWORD}"
  ]
}
