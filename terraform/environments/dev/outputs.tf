output "vpc_id" {
  description = "ID of the VPC"
  value       = module.weiqi_infrastructure.vpc_id
}

output "db_endpoint" {
  description = "Endpoint of the database"
  value       = module.weiqi_infrastructure.db_endpoint
}

output "redis_endpoint" {
  description = "Endpoint of the Redis cache"
  value       = module.weiqi_infrastructure.redis_endpoint
}

output "ec2_public_ip" {
  description = "Public IP of the EC2 instance"
  value       = module.weiqi_infrastructure.ec2_public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = module.weiqi_infrastructure.ec2_public_dns
}

output "application_url" {
  description = "URL of the application"
  value       = module.weiqi_infrastructure.application_url
}

output "artifact_bucket" {
  description = "Name of the S3 bucket for artifacts"
  value       = module.weiqi_infrastructure.artifact_bucket
} 