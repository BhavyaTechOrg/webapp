

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
  image_name          = "csye6225-webapp-{{timestamp}}"
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
      "sudo apt-get install -y unzip nodejs npm",

      "echo 'Extracting application files...'",
      "sudo mkdir -p /opt/webapp",
      "sudo unzip /tmp/webapp.zip -d /tmp/webapp",
      "ls -la /opt/webapp/",

      "sudo groupadd csye6225 || echo 'Group already exists'",
      "sudo useradd --system -g csye6225 csye6225 || echo 'User already exists'",
      "sudo chown -R csye6225:csye6225 /opt/webapp",

      "if [ -f /opt/webapp/package.json ]; then",
      "  echo 'Installing Node.js dependencies...'",
      "  cd /opt/webapp && sudo npm install --production",
      "fi",

      "echo 'Configuring systemd service...'",
      "sudo cp /tmp/systemd.service /etc/systemd/system/webapp.service",
      "sudo chmod 644 /etc/systemd/system/webapp.service",
      "sudo systemctl daemon-reload",
      "sudo systemctl enable webapp.service",
      "sudo systemctl start webapp.service",
      "sudo systemctl status webapp.service || true"
    ]
    environment_vars = [
      "NODE_ENV=production",
      "PORT=3000",
      "POSTGRES_DB=webapp",

    ]
  }
}
