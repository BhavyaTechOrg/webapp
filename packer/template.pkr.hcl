variable "ami_id" {
  type        = string
  description = "AMI ID of source image"
}

source "amazon-ebs" "ubuntu" {
  ami_name      = "csye6225-webapp-{{timestamp}}"
  instance_type = "t2.micro"
  region        = "us-east-1"
  source_ami    = var.ami_id
  ami_users     = ["888577018328", "194722445792"]
  ssh_username  = "ubuntu"
}

build {
  sources = ["source.amazon-ebs.ubuntu"]

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
      "sudo apt-get install -y unzip nodejs npm",

      # Debugging - check zip contents before extraction
      "echo 'Debugging: Showing zip file contents...'",
      "unzip -l /tmp/webapp.zip",

      # Extract application files
      "echo 'Extracting application files...'",
      "sudo mkdir -p /opt/webapp",
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
      "else",
      "  echo 'WARNING: No package.json found in /opt/webapp/'",
      "fi",

      # Setup and configure systemd service
      "echo 'Configuring systemd service...'",
      "sudo cp /tmp/systemd.service /etc/systemd/system/webapp.service",
      "sudo chmod 644 /etc/systemd/system/webapp.service",

      # Reload systemd and start service
      "sudo systemctl daemon-reload",
      "sudo systemctl enable webapp.service",
      "sudo systemctl start webapp.service",

      # More detailed service status information for debugging
      "echo 'Service status:'",
      "sudo systemctl status webapp.service || true",

      # Check service logs for more detailed error information
      "echo 'Service logs:'",
      "sudo journalctl -u webapp.service --no-pager -n 20 || true"
    ]
    environment_vars = [
      "NODE_ENV=production",
      "PORT=3000",
    ]
  }
}
