variable "POSTGRES_USER" {
  type = string
}

variable "POSTGRES_PASSWORD" {
  type = string
}

variable "ami_id" {
  type        = string
  description = "AMI ID of source image"
}

variable "GCP_PROJECT_ID" {
  type        = string
  description = "Google Cloud Project ID"
}

variable "IMAGE_NAME" {
  type        = string
  description = "Image name for Google Compute Engine"
}

source "amazon-ebs" "ubuntu" {
  ami_name      = "csye6225-webapp-{{timestamp}}"
  instance_type = "t2.micro"
  region        = "us-east-1"
  source_ami    = var.ami_id
  ssh_username  = "ubuntu"
}

source "googlecompute" "default" {
  image_name          = "csye6225-webapp-{{timestamp}}"
  project_id          = "dev-webapp-project-451723"
  source_image_family = "ubuntu-2404-lts-amd64"
  zone                = "us-central1-a"
  ssh_username        = "ubuntu"
}

build {
  sources = ["source.amazon-ebs.ubuntu", "source.googlecompute.default"]

  provisioner "file" {
    source      = "packer/files/webapp.zip"
    destination = "/tmp/webapp.zip"
  }

  provisioner "file" {
    source      = "packer/files/webapp.service"
    destination = "/tmp/systemd.service"
  }

  provisioner "shell" {
    inline = [
      "set -e",
      "echo 'Updating system packages...'",
      "sudo apt-get update",
      "echo 'Installing dependencies...'",
      "sudo apt-get install -y unzip nodejs npm corepack postgresql postgresql-contrib",

      # Ensure Node.js package manager is enabled
      "sudo corepack enable",

      # Ensure PostgreSQL is running and configured
      "echo 'Starting PostgreSQL service...'",
      "sudo systemctl enable postgresql",
      "sudo systemctl restart postgresql",
      "echo 'Creating PostgreSQL database and user if not exists...'",
      "sudo -u postgres psql -c \"SELECT 'CREATE DATABASE webapp' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'webapp')\\gexec\"",
      "sudo -u postgres psql -c \"DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${var.POSTGRES_USER}') THEN CREATE USER ${var.POSTGRES_USER} WITH ENCRYPTED PASSWORD '${var.POSTGRES_PASSWORD}'; END IF; END $$;\"",
      "sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE webapp TO ${var.POSTGRES_USER};\"",
      "sudo -u postgres psql -c \"ALTER DATABASE webapp OWNER TO ${var.POSTGRES_USER};\"",
      "sudo systemctl restart postgresql",

      # Extract application & install dependencies
      "echo 'Extracting application files...'",
      "sudo unzip /tmp/webapp.zip -d /opt/webapp/",
      "sudo groupadd csye6225",
      "sudo useradd --system -g csye6225 csye6225",
      "sudo chown -R csye6225:csye6225 /opt/webapp",
      "echo 'Installing Node.js dependencies...'",
      "sudo npm install --production --prefix /opt/webapp",
      

      # Setup systemd service
      "echo 'Configuring systemd service...'",
      "sudo cp /tmp/systemd.service /etc/systemd/system/webapp.service",
      "sudo chmod 644 /etc/systemd/system/webapp.service",
      "sudo systemctl daemon-reload",
      "sudo systemctl enable webapp.service",
      "sudo systemctl start webapp.service",

      # Persist Environment Variables
      "echo 'Persisting environment variables...'",
      "echo 'NODE_ENV=production' | sudo tee -a /etc/environment",
      "echo 'PORT=3000' | sudo tee -a /etc/environment",
      "echo 'POSTGRES_DB=webapp' | sudo tee -a /etc/environment",
      "echo 'POSTGRES_USER=${var.POSTGRES_USER}' | sudo tee -a /etc/environment",
      "echo 'POSTGRES_PASSWORD=${var.POSTGRES_PASSWORD}' | sudo tee -a /etc/environment",

      # Validate services are running
      "echo 'Checking service statuses...'",
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
}
