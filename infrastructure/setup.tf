provider "aws" {
  region = "us-east-1"
  default_tags {
    tags = {
      App = "Bingo"
      Environment = var.environment-suffix == "" ? "prod" : substr(var.environment-suffix, 1, -1)
    }
  }
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
