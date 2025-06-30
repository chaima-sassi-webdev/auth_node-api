terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.2"
    }
  }
}

provider "docker" {}

# Réseau utilisé par Docker Compose

resource "docker_network" "app_network" {
  name = "monitoring"
}

# Volume utilisé par PostgreSQL

resource "docker_volume" "pg_data" {
  name = "postgres_data"
}

# Lancer automatiquement le playbook Ansible

resource "null_resource" "run_ansible" {
  provisioner "local-exec" {
    working_dir = "../ansible"
    command = "ansible-playbook -i ../ansible/inventory/hosts.ini ../ansible/playbook/deploy.yml --ask-become-pass"
  }
}
