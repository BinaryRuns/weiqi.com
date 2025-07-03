# Get the latest Amazon Linux 2 AMI
data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Create an IAM role for the EC2 instance
resource "aws_iam_role" "ec2_role" {
  name = "${var.project_name}-${var.environment}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# Attach policies
resource "aws_iam_role_policy_attachment" "ssm_policy" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "ecr_policy" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess"
}

# Create an instance profile
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.project_name}-${var.environment}-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

# Create a key pair for SSH access
resource "aws_key_pair" "ec2_key" {
  key_name   = "${var.project_name}-${var.environment}-key"
  public_key = var.ssh_public_key != "" ? var.ssh_public_key : file("~/.ssh/id_rsa.pub")
}

# Create the EC2 instance
resource "aws_instance" "app_server" {
  ami                    = data.aws_ami.amazon_linux_2.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.ec2_key.key_name
  vpc_security_group_ids = [var.security_group_id]
  subnet_id              = var.subnet_id
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    amazon-linux-extras install docker -y
    systemctl enable docker
    systemctl start docker
    
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    mkdir -p /app
    
    cat > /app/docker-compose.yml << 'DOCKERCOMPOSE'
    version: '3'
    services:
      backend:
        image: ${var.docker_image}
        restart: always
        ports:
          - "80:8080"
        environment:
          - SPRING_DATASOURCE_URL=jdbc:postgresql://${var.db_endpoint}:${var.db_port}/${var.db_name}
          - SPRING_DATASOURCE_USERNAME=${var.db_username}
          - SPRING_DATASOURCE_PASSWORD=${var.db_password}
          - SPRING_DATA_REDIS_HOST=${var.redis_endpoint}
          - SPRING_DATA_REDIS_PORT=${var.redis_port}
          - SPRING_PROFILES_ACTIVE=${var.environment}
          - SUPABASE_JWT_SECRET=${var.supabase_jwt_secret}
    DOCKERCOMPOSE
    
    cd /app
    docker-compose up -d
  EOF

  tags = {
    Name = "${var.project_name}-${var.environment}-app"
  }
} 