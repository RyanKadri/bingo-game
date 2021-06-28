resource "aws_dynamodb_table" "game-table" {
  hash_key = "id"
  name = "bingo-games${var.environment-suffix}"
  billing_mode = var.dynamo-billing-mode
  write_capacity = var.starting-write-capacity
  read_capacity = var.starting-read-capacity
  attribute {
    name = "id"
    type = "S"
  }
  ttl {
    attribute_name = "expirationDate"
    enabled = true
  }
  lifecycle {
    ignore_changes = [write_capacity, read_capacity]
  }
}

resource "aws_dynamodb_table" "board-table" {
  hash_key = "id"
  name = "bingo-boards${var.environment-suffix}"
  billing_mode = var.dynamo-billing-mode
  write_capacity = var.starting-write-capacity
  read_capacity = var.starting-read-capacity
  attribute {
    name = "id"
    type = "S"
  }
  ttl {
    attribute_name = "expirationDate"
    enabled = true
  }
  lifecycle {
    ignore_changes = [write_capacity, read_capacity]
  }
}

resource "aws_dynamodb_table" "player-table" {
  hash_key = "id"
  name = "bingo-players${var.environment-suffix}"
  billing_mode = var.dynamo-billing-mode
  write_capacity = var.starting-write-capacity
  read_capacity = var.starting-read-capacity
  attribute {
    name = "id"
    type = "S"
  }
  attribute {
    name = "connectionId"
    type = "S"
  }
  global_secondary_index {
    hash_key = "connectionId"
    range_key = "id"
    name = "bingo-players-by-connection"
    projection_type = "ALL"
    write_capacity = var.starting-write-capacity
    read_capacity = var.starting-read-capacity
  }
  ttl {
    attribute_name = "expirationDate"
    enabled = true
  }
  lifecycle {
    ignore_changes = [write_capacity, read_capacity]
  }
}

resource "aws_ssm_parameter" "game_table_name" {
  name = "bingo-game-table${var.environment-suffix}"
  type = "String"
  value = aws_dynamodb_table.game-table.name
}

resource "aws_ssm_parameter" "board_table_name" {
  name = "bingo-board-table${var.environment-suffix}"
  type = "String"
  value = aws_dynamodb_table.board-table.name
}

resource "aws_ssm_parameter" "player_table_name" {
  name = "bingo-player-table${var.environment-suffix}"
  type = "String"
  value = aws_dynamodb_table.player-table.name
}