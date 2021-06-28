#!/bin/bash
terraform workspace select default
terraform apply --var-file ./prod.tfvars