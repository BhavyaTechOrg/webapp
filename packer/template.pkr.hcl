provisioner "shell" {
  inline = [
    "set -e",
    "echo 'Checking Node.js version...'",
    "node -v",
    "echo 'Checking npm version...'",
    "npm -v",
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

    # Verify application files
    "echo 'Verifying application files:'",
    "ls -la /opt/webapp/",
    "if [ ! -f /opt/webapp/index.js ]; then",
    "  echo 'ERROR: index.js not found in /opt/webapp/'",
    "  exit 1",
    "fi",

    # Set up proper permissions
    "echo 'Setting permissions for /opt/webapp...'",
    "sudo chown -R csye6225:csye6225 /opt/webapp",

    # Install dependencies if package.json exists
    "if [ -f /opt/webapp/package.json ]; then",
    "  echo 'Installing Node.js dependencies...'",
    "  cd /opt/webapp && sudo npm install --production",
    "else",
    "  echo 'WARNING: No package.json found in /opt/webapp/'",
    "fi",

    # Enable and start the service
    "echo 'Configuring systemd service...'",
    "sudo cp /tmp/systemd.service /etc/systemd/system/webapp.service",
    "sudo chmod 644 /etc/systemd/system/webapp.service",
    "sudo systemctl daemon-reload",
    "sudo systemctl enable webapp.service",
    "sudo systemctl start webapp.service",

    # Check service status
    "echo 'Service status:'",
    "sudo systemctl status webapp.service || true"
  ]
}
