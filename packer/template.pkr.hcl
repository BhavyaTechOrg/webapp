variable "POSTGRES_USER" {
  type = string
}

variable "POSTGRES_PASSWORD" {
  type = string
}

source "amazon-ebs" "ubuntu" {
  ami_name      = "csye6225-webapp-{{timestamp}}" # Unique AMI name
  instance_type = "t2.micro"
  region        = "us-east-1"


  source_ami_filter {
    filters = {
      name                = "ubuntu-24.04-*-amd64-server-*"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = ["099720109477"] # Canonical (Ubuntu)
  }

  ssh_username = "ubuntu"
}

source "googlecompute" "default" {
  image_name          = "csye6225-webapp-{{timestamp}}"
  project_id          = "dev-webapp-project-451723" # Replace with actual GCP Project ID
  source_image_family = "ubuntu-2404-lts"
  zone                = "us-central1-a"
  ssh_username        = "ubuntu" # Fix: Explicitly set SSH username
}

build {
  sources = ["source.amazon-ebs.ubuntu", "source.googlecompute.default"]

  provisioner "shell" {
    inline = [
      "set -e", # Exit immediately on error
      "echo 'Updating system packages...'",
      "sudo apt-get update",
      "echo 'Installing dependencies...'",
      "sudo apt-get install -y nodejs npm postgresql postgresql-contrib",

      # Ensure PostgreSQL is running and configured
      "echo 'Starting PostgreSQL service...'",
      "sudo systemctl start postgresql",
      "echo 'Creating PostgreSQL database and user...'",
      "sudo -u postgres psql -c \"CREATE DATABASE webapp;\"",
      "sudo -u postgres psql -c \"CREATE USER ${var.POSTGRES_USER} WITH ENCRYPTED PASSWORD '${var.POSTGRES_PASSWORD}';\"",
      "sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE webapp TO ${var.POSTGRES_USER};\"",
      "sudo systemctl restart postgresql",

      # Extract application & install dependencies
      "echo 'Extracting application files...'",
      "sudo cp /tmp/webapp.tar.gz /opt/webapp/webapp.tar.gz",
      "cd /opt/webapp",
      "tar -xvf webapp.tar.gz",
      "echo 'Installing Node.js dependencies...'",
      "NODE_ENV=production npm install --omit=dev",
      "npm run build",
      "sudo chown -R csye6225:csye6225 /opt/webapp",

      # Setup systemd service
      "echo 'Configuring systemd service...'",
      "sudo cp /tmp/systemd.service /etc/systemd/system/webapp.service",
      "sudo systemctl daemon-reload",
      "sudo systemctl enable webapp.service",
      "sudo systemctl start webapp.service",

      # Verify service is running
      "echo 'Checking webapp service status...'",
      "sudo systemctl status webapp.service -l"
    ]
    environment_vars = [
      "NODE_ENV=production",
      "PORT=3000",
      "POSTGRES_DB=webapp",
      "POSTGRES_USER=${var.POSTGRES_USER}",
      "POSTGRES_PASSWORD=${var.POSTGRES_PASSWORD}"
    ]
  }

  provisioner "file" {
    source      = "packer/files/webapp.tar.gz"
    destination = "/tmp/webapp.tar.gz"
  }

  provisioner "file" {
    source      = "packer/files/webapp.service"
    destination = "/tmp/systemd.service"
  }
}
