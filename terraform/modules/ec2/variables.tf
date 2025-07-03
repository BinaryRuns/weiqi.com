variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "security_group_id" {
  description = "ID of the security group for EC2"
  type        = string
}

variable "subnet_id" {
  description = "ID of the subnet for EC2"
  type        = string
}

variable "ssh_public_key" {
  description = "SSH public key for EC2 access"
  type        = string
  default     = ""
}

variable "docker_image" {
  description = "Docker image for the application"
  type        = string
  default     = "your-registry/weiqi-backend:latest"
}

# Database connection variables
variable "db_endpoint" {
  description = "Endpoint of the database"
  type        = string
}

variable "db_port" {
  description = "Port of the database"
  type        = number
  default     = 5432
}

variable "db_name" {
  description = "Name of the database"
  type        = string
}

variable "db_username" {
  description = "Username for the database"
  type        = string
}

variable "db_password" {
  description = "Password for the database"
  type        = string
}

# Redis connection variables
variable "redis_endpoint" {
  description = "Endpoint of the Redis cache"
  type        = string
}

variable "redis_port" {
  description = "Port of the Redis cache"
  type        = number
  default     = 6379
}

# Supabase variables
variable "supabase_jwt_secret" {
  description = "Supabase JWT secret"
  type        = string
  default     = ""
} 