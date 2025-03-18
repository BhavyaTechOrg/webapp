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
    source      = "webapp.zip"
    destination = "/tmp/webapp.zip"
  }

  provisioner "file" {
    source      = "webapp.service"
    destination = "/tmp/webapp.service"
  }

  provisioner "shell" {
    inline = [
      "set -e",
      "echo 'Updating system packages...'",
      "sudo apt-get update",
      "echo 'Installing dependencies...'",
      "sudo apt-get install -y unzip nodejs npm",
      
      "echo 'Creating application user...'",
      "sudo groupadd csye6225 || echo 'Group already exists'",
      "sudo useradd --system -g csye6225 csye6225 || echo 'User already exists'",
      
      "echo 'Extracting application files...'",
      "sudo mkdir -p /opt/webapp",
      "sudo unzip -o /tmp/webapp.zip -d /tmp/webapp",
      "sudo cp -R /tmp/webapp/* /opt/webapp/",
      
      "echo 'Setting permissions...'",
      "sudo chown -R csye6225:csye6225 /opt/webapp",
      
      "echo 'Installing Node.js dependencies...'",
      "cd /opt/webapp && sudo npm install --production",
      
      "echo 'Creating placeholder webapp.env file...'",
      "sudo sh -c 'echo \"NODE_ENV=production\" > /etc/webapp.env'",
      "sudo sh -c 'echo \"PORT=3000\" >> /etc/webapp.env'",
      "sudo chmod 600 /etc/webapp.env",
      "sudo chown csye6225:csye6225 /etc/webapp.env",
      
      "echo 'Configuring systemd service...'",
      "sudo cp /tmp/webapp.service /etc/systemd/system/webapp.service",
      "sudo chmod 644 /etc/systemd/system/webapp.service",
      "sudo systemctl daemon-reload",
      "sudo systemctl enable webapp.service",
      
      "echo 'AMI build completed successfully'"
    ]
  }
}