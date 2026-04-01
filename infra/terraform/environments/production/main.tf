# ChainFlow Platform — Terraform Production Environment
# AWS Region: us-east-1
# Run: terraform init && terraform plan && terraform apply

terraform {
  required_version = ">= 1.7.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.28"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  backend "s3" {
    bucket         = "chainflow-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "chainflow-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "ChainFlow"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "Platform Team"
    }
  }
}

# ── Variables ────────────────────────────────────────────────────────

variable "aws_region" {
  default = "us-east-1"
}

variable "environment" {
  default = "production"
}

variable "cluster_name" {
  default = "chainflow-production"
}

variable "cluster_version" {
  default = "1.29"
}

variable "db_instance_class" {
  default = "db.r6g.xlarge"
}

variable "db_allocated_storage" {
  default = 100
}

variable "redis_node_type" {
  default = "cache.r6g.large"
}

variable "kafka_instance_type" {
  default = "kafka.m5.large"
}

variable "vpc_cidr" {
  default = "10.0.0.0/16"
}

# ── Data Sources ─────────────────────────────────────────────────────

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# ── VPC ──────────────────────────────────────────────────────────────

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.7"

  name = "chainflow-${var.environment}-vpc"
  cidr = var.vpc_cidr

  azs             = slice(data.aws_availability_zones.available.names, 0, 3)
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  intra_subnets   = ["10.0.201.0/24", "10.0.202.0/24", "10.0.203.0/24"]

  enable_nat_gateway   = true
  single_nat_gateway   = false
  enable_dns_hostnames = true
  enable_dns_support   = true

  public_subnet_tags = {
    "kubernetes.io/role/elb" = 1
  }

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = 1
  }
}

# ── EKS Cluster ──────────────────────────────────────────────────────

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.8"

  cluster_name    = var.cluster_name
  cluster_version = var.cluster_version

  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.private_subnets
  control_plane_subnet_ids = module.vpc.intra_subnets

  cluster_endpoint_public_access = true

  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
    aws-ebs-csi-driver = {
      most_recent = true
    }
  }

  eks_managed_node_groups = {
    # General workloads
    general = {
      instance_types = ["m6i.xlarge"]
      min_size       = 2
      max_size       = 10
      desired_size   = 3

      labels = {
        workload = "general"
      }
    }

    # AI/ML workloads
    ai_compute = {
      instance_types = ["c6i.2xlarge"]
      min_size       = 1
      max_size       = 5
      desired_size   = 2

      labels = {
        workload = "ai-compute"
      }

      taints = [{
        key    = "dedicated"
        value  = "ai-engine"
        effect = "NO_SCHEDULE"
      }]
    }
  }

  cluster_security_group_additional_rules = {
    ingress_nodes_ephemeral_ports_tcp = {
      description                = "Nodes on ephemeral ports"
      protocol                   = "tcp"
      from_port                  = 1025
      to_port                    = 65535
      type                       = "ingress"
      source_node_security_group = true
    }
  }
}

# ── RDS PostgreSQL (Multi-AZ) ────────────────────────────────────────

resource "aws_db_subnet_group" "chainflow" {
  name       = "chainflow-${var.environment}"
  subnet_ids = module.vpc.private_subnets
}

resource "random_password" "db_password" {
  length  = 32
  special = false
}

resource "aws_secretsmanager_secret" "db_credentials" {
  name = "chainflow/${var.environment}/db-credentials"
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = "chainflow"
    password = random_password.db_password.result
  })
}

resource "aws_db_instance" "chainflow" {
  identifier        = "chainflow-${var.environment}"
  engine            = "postgres"
  engine_version    = "16.2"
  instance_class    = var.db_instance_class
  allocated_storage = var.db_allocated_storage
  storage_type      = "gp3"
  storage_encrypted = true

  db_name  = "chainflow_db"
  username = "chainflow"
  password = random_password.db_password.result

  multi_az               = true
  db_subnet_group_name   = aws_db_subnet_group.chainflow.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period   = 30
  backup_window             = "03:00-04:00"
  maintenance_window        = "Mon:04:00-Mon:05:00"
  auto_minor_version_upgrade = true
  deletion_protection       = true
  skip_final_snapshot       = false
  final_snapshot_identifier = "chainflow-${var.environment}-final"

  performance_insights_enabled = true
  monitoring_interval          = 60
  monitoring_role_arn          = aws_iam_role.rds_monitoring.arn

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
}

# ── ElastiCache Redis (Cluster Mode) ────────────────────────────────

resource "aws_elasticache_replication_group" "chainflow" {
  replication_group_id = "chainflow-${var.environment}"
  description          = "ChainFlow Redis cluster"

  node_type               = var.redis_node_type
  num_cache_clusters      = 3
  automatic_failover_enabled = true
  multi_az_enabled        = true

  engine_version          = "7.2"
  port                    = 6379
  parameter_group_name    = "default.redis7"

  subnet_group_name       = aws_elasticache_subnet_group.chainflow.name
  security_group_ids      = [aws_security_group.redis.id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true

  snapshot_retention_limit = 7
  snapshot_window          = "04:00-05:00"
}

resource "aws_elasticache_subnet_group" "chainflow" {
  name       = "chainflow-${var.environment}"
  subnet_ids = module.vpc.private_subnets
}

# ── MSK Kafka ────────────────────────────────────────────────────────

resource "aws_msk_cluster" "chainflow" {
  cluster_name           = "chainflow-${var.environment}"
  kafka_version          = "3.6.0"
  number_of_broker_nodes = 3

  broker_node_group_info {
    instance_type   = var.kafka_instance_type
    client_subnets  = module.vpc.private_subnets
    storage_info {
      ebs_storage_info {
        volume_size = 1000
      }
    }
    security_groups = [aws_security_group.kafka.id]
  }

  encryption_info {
    encryption_in_transit {
      client_broker = "TLS"
      in_cluster    = true
    }
  }

  logging_info {
    broker_logs {
      cloudwatch_logs {
        enabled   = true
        log_group = "/chainflow/kafka"
      }
    }
  }
}

# ── S3 Buckets ───────────────────────────────────────────────────────

resource "aws_s3_bucket" "uploads" {
  bucket = "chainflow-${var.environment}-uploads-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket_versioning" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}

# ── Security Groups ──────────────────────────────────────────────────

resource "aws_security_group" "rds" {
  name        = "chainflow-${var.environment}-rds"
  description = "RDS PostgreSQL security group"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [module.eks.cluster_security_group_id]
  }
}

resource "aws_security_group" "redis" {
  name        = "chainflow-${var.environment}-redis"
  description = "ElastiCache Redis security group"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [module.eks.cluster_security_group_id]
  }
}

resource "aws_security_group" "kafka" {
  name        = "chainflow-${var.environment}-kafka"
  description = "MSK Kafka security group"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 9092
    to_port         = 9092
    protocol        = "tcp"
    security_groups = [module.eks.cluster_security_group_id]
  }
  ingress {
    from_port       = 9094
    to_port         = 9094
    protocol        = "tcp"
    security_groups = [module.eks.cluster_security_group_id]
  }
}

# ── IAM Roles ────────────────────────────────────────────────────────

resource "aws_iam_role" "rds_monitoring" {
  name = "chainflow-rds-monitoring"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "monitoring.rds.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# ── Outputs ──────────────────────────────────────────────────────────

output "eks_cluster_endpoint" {
  value     = module.eks.cluster_endpoint
  sensitive = true
}

output "rds_endpoint" {
  value     = aws_db_instance.chainflow.endpoint
  sensitive = true
}

output "redis_endpoint" {
  value     = aws_elasticache_replication_group.chainflow.primary_endpoint_address
  sensitive = true
}

output "kafka_bootstrap_brokers" {
  value     = aws_msk_cluster.chainflow.bootstrap_brokers_tls
  sensitive = true
}

output "s3_uploads_bucket" {
  value = aws_s3_bucket.uploads.bucket
}
