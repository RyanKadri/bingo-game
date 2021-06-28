#!/bin/bash
terraform workspace select dev
terraform apply --var-file ./dev.tfvars