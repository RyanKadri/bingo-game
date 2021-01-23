resource "aws_dynamodb_table" "game-table" {
  hash_key = "id"
  name = "bingo-games"
  billing_mode = "PROVISIONED"
  write_capacity = 15
  read_capacity = 15
  attribute {
    name = "id"
    type = "S"
  }
  lifecycle {
    ignore_changes = [write_capacity, read_capacity]
  }
}

resource "aws_dynamodb_table" "board-table" {
  hash_key = "id"
  name = "bingo-boards"
  billing_mode = "PROVISIONED"
  write_capacity = 15
  read_capacity = 15
  attribute {
    name = "id"
    type = "S"
  }
  lifecycle {
    ignore_changes = [write_capacity, read_capacity]
  }
}

resource "aws_dynamodb_table" "player-table" {
  hash_key = "id"
  name = "bingo-players"
  billing_mode = "PROVISIONED"
  write_capacity = 15
  read_capacity = 15
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
    write_capacity = 15
    read_capacity = 15
  }
  lifecycle {
    ignore_changes = [write_capacity, read_capacity]
  }
}

resource "aws_ssm_parameter" "game_table_name" {
  name = "bingo-game-table"
  type = "String"
  value = aws_dynamodb_table.game-table.name
}

resource "aws_ssm_parameter" "board_table_name" {
  name = "bingo-board-table"
  type = "String"
  value = aws_dynamodb_table.board-table.name
}

resource "aws_ssm_parameter" "player_table_name" {
  name = "bingo-player-table"
  type = "String"
  value = aws_dynamodb_table.player-table.name
}