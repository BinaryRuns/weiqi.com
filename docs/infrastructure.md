# Weiqi.com Infrastructure Endpoints

## ElastiCache (Redis)

- **Endpoint:** weiqi-dev-redis.npiotz.0001.use1.cache.amazonaws.com
- **Port:** 6379
- **Region:** us-east-1
- **VPC ID:** vpc-058a900bd549a3cae
- **Redis Version:** 7.0.7
- **Node Type:** cache.t2.micro

## EC2

- **IP:** 34.238.220.156
- **Region:** us-east-1
- **VPC ID:** vpc-058a900bd549a3cae

## Quick Commands

### Connect to Redis from EC2

```bash
redis-cli -h weiqi-dev-redis.npiotz.0001.use1.cache.amazonaws.com -p 6379
```

### SSH to EC2

```bash
ssh ec2-user@34.238.220.156
```
