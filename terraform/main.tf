terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {}

# Réseau personnalisé
resource "docker_network" "app_network" {
  name = "app_network"
}

# Conteneur PostgreSQL
resource "docker_container" "postgres" {
  name  = "postgres-db"
  image = docker_image.postgres.name

  networks_advanced {
    name = docker_network.app_network.name
  }

  env = [
    "POSTGRES_USER=admin",
    "POSTGRES_PASSWORD=secret",
    "POSTGRES_DB=mydb"
  ]

  ports {
    internal = 5432
    external = 5432
  }
}

resource "docker_image" "postgres" {
  name = "postgres:15"
}

# Conteneur backend API
resource "docker_container" "auth_api" {
  name  = "auth-api"
  image = docker_image.auth_api.name

  networks_advanced {
    name = docker_network.app_network.name
  }

  ports {
    internal = 3000
    external = 3000
  }

  depends_on = [docker_container.postgres]
}

resource "docker_image" "auth_api" {
  name = "chaimahs/auth-api:latest"
  build {
    context    = "../backend/"
    dockerfile = "Dockerfile"
  }


}
