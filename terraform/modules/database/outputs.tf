output "db_endpoint" {
  description = "Endpoint of the database"
  value       = aws_db_instance.main.address
}

output "db_name" {
  description = "Name of the database"
  value       = aws_db_instance.main.db_name
}

output "db_username" {
  description = "Username for the database"
  value       = aws_db_instance.main.username
}

output "db_port" {
  description = "Port for the database"
  value       = aws_db_instance.main.port
} 