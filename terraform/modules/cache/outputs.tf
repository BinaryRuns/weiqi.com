output "redis_endpoint" {
  description = "Endpoint of the Redis cache"
  value       = aws_elasticache_cluster.main.cache_nodes.0.address
}

output "redis_port" {
  description = "Port of the Redis cache"
  value       = aws_elasticache_cluster.main.cache_nodes.0.port
} 