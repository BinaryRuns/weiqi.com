output "vpc_id" {
  description = "ID of the VPC"
  value       = module.networking.vpc_id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = module.networking.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = module.networking.private_subnet_ids
}

output "db_endpoint" {
  description = "Endpoint of the database"
  value       = module.database.db_endpoint
}

output "redis_endpoint" {
  description = "Endpoint of the Redis cache"
  value       = module.cache.redis_endpoint
}

output "ec2_public_ip" {
  description = "Public IP of the EC2 instance"
  value       = module.ec2.instance_public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = module.ec2.instance_public_dns
}

output "application_url" {
  description = "URL of the application"
  value       = module.ec2.instance_url
}

output "artifact_bucket" {
  description = "Name of the S3 bucket for artifacts"
  value       = module.storage.bucket_name
} 