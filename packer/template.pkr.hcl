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

variable "IMAGE_NAME" {
  type        = string
  description = "Image name for Google Compute Engine"
}

variable "GCP_PROJECT_ID" {
  type        = string
  description = "GCP project ID for the Packer build"
}

variable "gcp_project_ids" {
  type = map(string)
  default = {
    dev  = "dev-webapp-project-451723"
    demo = "tidy-weaver-453318-i5"
  }
}

source "amazon-ebs" "ubuntu" {
  ami_name      = "csye6225-webapp-{{timestamp}}"
  instance_type = "t2.micro"
  region        = "us-east-1"
  source_ami    = var.ami_id
  ami_users     = ["888577018328", "194722445792"]
  ssh_username  = "ubuntu"
}

source "googlecompute" "default" {
  image_name            = "csye6225-webapp-{{timestamp}}"
  project_id          = var.gcp_project_ids["dev"]
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
      "sudo apt-get install -y unzip nodejs npm postgresql postgresql-contrib",

      # Debugging - check zip contents before extraction
      "echo 'Debugging: Showing zip file contents...'",
      "unzip -l /tmp/webapp.zip | grep index.js",

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
      "sudo mkdir -p /opt/webapp",

      # Better extraction approach to handle potential nested directories
      "sudo unzip /tmp/webapp.zip -d /tmp/webapp-extract",
      "echo 'Debugging: Extracted contents:'",
      "ls -la /tmp/webapp-extract",

      # Copy files to final destination, handling potential nested structure
      "if [ -f /tmp/webapp-extract/index.js ]; then",
      "  echo 'Found index.js at root level, copying all files...'",
      "  sudo cp -r /tmp/webapp-extract/* /opt/webapp/",
      "else",
      "  echo 'Looking for index.js in subdirectories...'",
      "  INDEX_DIR=$(find /tmp/webapp-extract -name 'index.js' -exec dirname {} \\; | head -1)",
      "  if [ -n \"$INDEX_DIR\" ]; then",
      "    echo \"Found index.js in $INDEX_DIR, copying files from there...\"",
      "    sudo cp -r \"$INDEX_DIR\"/* /opt/webapp/",
      "  else",
      "    echo 'ERROR: index.js not found in zip file!'",
      "    exit 1",
      "  fi",
      "fi",

      # Verify files are in the correct location
      "echo 'Verifying application files:'",
      "ls -la /opt/webapp/",
      "if [ ! -f /opt/webapp/index.js ]; then",
      "  echo 'ERROR: index.js not found in /opt/webapp/'",
      "  exit 1",
      "fi",

      # Set up proper permissions
      "sudo groupadd csye6225 || echo 'Group already exists'",
      "sudo useradd --system -g csye6225 csye6225 || echo 'User already exists'",
      "sudo chown -R csye6225:csye6225 /opt/webapp",

      # Install node dependencies if package.json exists
      "if [ -f /opt/webapp/package.json ]; then",
      "  echo 'Installing Node.js dependencies...'",
      "  cd /opt/webapp && sudo npm install --production",
      "fi",

      # Setup systemd service
      "echo 'Configuring systemd service...'",
      "sudo cp /tmp/systemd.service /etc/systemd/system/webapp.service",
      "sudo chmod 644 /etc/systemd/system/webapp.service",
      "sudo systemctl daemon-reload",
      "sudo systemctl enable webapp.service",
      "sudo systemctl start webapp.service",

      # Debug service status if it fails
      "sudo systemctl status webapp.service || true",

      # Validate services are running
      "echo 'Checking if services are running...'",
      "sudo systemctl is-active --quiet postgresql || (echo 'PostgreSQL service failed' && exit 1)",
      "sudo systemctl is-active --quiet webapp.service || (echo 'Webapp service failed' && exit 1)"
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