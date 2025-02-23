source "amazon-ebs" "ubuntu" {
  ami_name      = "csye6225-webapp-{{timestamp}}"  # Unique AMI name
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
  image_name           = "csye6225-webapp-{{timestamp}}"
  project_id           = "your-gcp-project-id"  # Replace with actual GCP Project ID
  source_image_family  = "ubuntu-2404-lts"
  zone                 = "us-central1-a"
}

build {
  sources = ["source.amazon-ebs.ubuntu", "source.googlecompute.default"]

  provisioner "shell" {
    inline = [
      "sudo apt-get update",
      "sudo apt-get install -y nodejs npm",  # Install Node.js and npm
      "sudo apt-get install -y postgresql postgresql-contrib",  # Install PostgreSQL
      "sudo groupadd csye6225",
      "sudo useradd -g csye6225 -s /usr/sbin/nologin csye6225",
      "sudo mkdir -p /opt/webapp",
      "sudo chown -R csye6225:csye6225 /opt/webapp",

      # Ensure PostgreSQL is Configured
      "sudo systemctl start postgresql",
      "sudo -u postgres psql -c \"CREATE DATABASE webapp;\"",
      "sudo -u postgres psql -c \"CREATE USER csye6225 WITH ENCRYPTED PASSWORD 'Root';\"",
      "sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE webapp TO csye6225;\"",

      # Extract Application & Set Permissions
      "sudo cp /tmp/webapp.tar.gz /opt/webapp/webapp.tar.gz",
      "cd /opt/webapp",
      "tar -xvf webapp.tar.gz",
      "npm install --omit=dev",  # Production dependencies only
      "npm run build",
      "sudo chown -R csye6225:csye6225 /opt/webapp",

      # Correctly Copy & Start Systemd Service
      "sudo cp /tmp/systemd.service /etc/systemd/system/webapp.service",
      "sudo systemctl daemon-reload",
      "sudo systemctl enable webapp.service",
      "sudo systemctl start webapp.service"
    ]
    environment_vars = [
      "NODE_ENV=production",
      "PORT=3000",
      "POSTGRES_DB=webapp",
      "POSTGRES_USER=csye6225"
    ]
  }

  provisioner "file" {
    source      = "packer/files/webapp.tar.gz"  # Corrected Path
    destination = "/tmp/webapp.tar.gz"
  }

  provisioner "file" {
    source      = "packer/files/webapp.service"  # Corrected Path
    destination = "/tmp/systemd.service"
  }
}
