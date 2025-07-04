variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "subnet_ids" {
  description = "IDs of the subnets"
  type        = list(string)
}

variable "security_group_id" {
  description = "ID of the security group for Redis"
  type        = string
  default     = ""
}

variable "redis_node_type" {
  description = "ElastiCache node type"
  type        = string
}

variable "redis_port" {
  description = "Port for Redis"
  type        = number
  default     = 6379
} 