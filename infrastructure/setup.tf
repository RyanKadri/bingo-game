provider "aws" {
  version = "~> 3.0"
  region = "us-east-1"
}

provider "archive" {

}

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_region" "stack-region" {
  provider = aws
}

data "aws_caller_identity" "current" {}
