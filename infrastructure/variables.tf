variable "environment-suffix" {
  type = string
  default = ""
  description = "The bingo app environment"
}

variable "starting-read-capacity" {
  type = number
  default = 5
}

variable "starting-write-capacity" {
  type = number
  default = 5
}