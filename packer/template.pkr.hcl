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

      "echo 'Extracting application files...'",
      "sudo mkdir -p /opt/webapp",
      "sudo unzip /tmp/webapp.zip -d /tmp/webapp",
      "sudo cp -R /tmp/webapp/* /opt/webapp/",
      "ls -la /opt/webapp/",

      "sudo groupadd csye6225 || echo 'Group already exists'",
      "sudo useradd --system -g csye6225 csye6225 || echo 'User already exists'",
      "sudo chown -R csye6225:csye6225 /opt/webapp",

      "if [ -f /opt/webapp/package.json ]; then",
      "  echo 'Installing Node.js dependencies...'",
      "  cd /opt/webapp && sudo npm install --production",
      "fi",

      "echo 'Creating placeholder webapp.env file...'",
      "sudo touch /etc/webapp.env",
      "sudo chmod 600 /etc/webapp.env",
      "sudo chown csye6225:csye6225 /etc/webapp.env",
      "sudo sh -c 'echo \"NODE_ENV=production\" > /etc/webapp.env'",
      "sudo sh -c 'echo \"PORT=3000\" >> /etc/webapp.env'",

      "echo 'Configuring systemd service...'",
      "sudo cp /tmp/systemd.service /etc/systemd/system/webapp.service",
      "sudo chmod 644 /etc/systemd/system/webapp.service",
      "sudo systemctl daemon-reload",
      "sudo systemctl enable webapp.service",

      "echo 'Installing CloudWatch Unified Agent...'",
      "wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb",
      "sudo dpkg -i amazon-cloudwatch-agent.deb",

      "echo 'Configuring CloudWatch Agent...'",
      "sudo mkdir -p /opt/aws/amazon-cloudwatch-agent/etc",
      "sudo touch /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json",

      "echo 'Note: Service will be started by user-data when instance launches with proper database credentials'"
    ]
    environment_vars = [
      "NODE_ENV=production",
      "PORT=3000"
    ]
  }
}
