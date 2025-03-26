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

      "echo 'Installing dependencies (unzip, nodejs, npm)...'",
      "sudo apt-get install -y unzip nodejs npm",

      "echo 'Extracting application files to /opt/webapp...'",
      "sudo mkdir -p /opt/webapp",
      "sudo unzip /tmp/webapp.zip -d /tmp/webapp",
      "sudo cp -R /tmp/webapp/* /opt/webapp/",
      "sudo ls -la /opt/webapp/",

      "echo 'Creating csye6225 user/group if not exists...'",
      "sudo groupadd csye6225 || echo 'Group already exists'",
      "sudo useradd --system -g csye6225 csye6225 || echo 'User already exists'",
      "sudo chown -R csye6225:csye6225 /opt/webapp",

      "if [ -f /opt/webapp/package.json ]; then",
      "  echo 'Installing Node.js production dependencies...'",
      "  cd /opt/webapp && sudo npm install --production",
      "fi",

      "echo 'Creating placeholder /etc/webapp.env file...'",
      "sudo touch /etc/webapp.env",
      "sudo chmod 600 /etc/webapp.env",
      "sudo chown csye6225:csye6225 /etc/webapp.env",
      "echo 'NODE_ENV=production' | sudo tee /etc/webapp.env",
      "echo 'PORT=3000' | sudo tee -a /etc/webapp.env",

      "echo 'Installing webapp.service into systemd...'",
      "sudo cp /tmp/systemd.service /etc/systemd/system/webapp.service",
      "sudo chmod 644 /etc/systemd/system/webapp.service",
      "sudo systemctl daemon-reload",
      "sudo systemctl enable webapp.service",

      "echo 'Creating /var/log/webapp directory for Winston logs...'",
      "sudo mkdir -p /var/log/webapp",
      "sudo chown csye6225:csye6225 /var/log/webapp",
      "sudo chmod 755 /var/log/webapp",

      "echo 'Installing CloudWatch Unified Agent (safe)...'",
      "wget -O /tmp/amazon-cloudwatch-agent.deb https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb",
      "sudo dpkg -i /tmp/amazon-cloudwatch-agent.deb || sudo apt-get install -f -y",

      "echo 'Creating placeholder config for CloudWatch Agent...'",
      "sudo mkdir -p /opt/aws/amazon-cloudwatch-agent/etc",
      "sudo touch /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json",

      "echo 'Build complete. Service will be started by EC2 user-data.'"
    ]

    environment_vars = [
      "NODE_ENV=production",
      "PORT=3000"
    ]
  }
}
