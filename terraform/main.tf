terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.2"
    }
  }
}

provider "docker" {}

# Réseau utilisé par les conteneurs
resource "docker_network" "app_network" {
  name = "monitoring"
}

# Volume pour PostgreSQL
resource "docker_volume" "pg_data" {
  name = "postgres_data"
}

# Conteneur PostgreSQL
resource "docker_container" "postgres" {
  name  = "postgres"
  image = "postgres:15"
  networks_advanced {
    name = docker_network.app_network.name
  }

  volumes {
    volume_name    = docker_volume.pg_data.name
    container_path = "/var/lib/postgresql/data"
  }

  env = [
    "POSTGRES_USER=admin",
    "POSTGRES_PASSWORD=admin",
    "POSTGRES_DB=auth_db"
  ]

  ports {
    internal = 5432
    external = 5432
  }
}

# Conteneur Backend (API Node.js)
resource "docker_container" "backend" {
  name  = "backend-api"
  image = "chaimahs/auth-api:latest"  # Remplace par le bon nom d’image si différent
  depends_on = [docker_container.postgres]
  networks_advanced {
    name = docker_network.app_network.name
  }

  env = [
    "DATABASE_URL=postgresql://admin:admin@postgres:5432/auth_db"
  ]

  ports {
    internal = 8080
    external = 8080
  }
}

# Conteneur Frontend (React)
resource "docker_container" "frontend" {
  name  = "frontend-app"
  image = "chaimahs/frontend:latest"  # Remplace par le bon nom d’image si différent
  depends_on = [docker_container.backend]
  networks_advanced {
    name = docker_network.app_network.name
  }

  ports {
    internal = 3001
    external = 3001
  }
}

# Exécution automatique du playbook Ansible
resource "null_resource" "run_ansible" {
  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    working_dir = "../ansible"
    command = "ansible-playbook -i ../ansible/inventory/hosts.ini ../ansible/playbook/deploy.yml"
  }
}

