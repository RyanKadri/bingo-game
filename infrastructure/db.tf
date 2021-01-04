resource "aws_dynamodb_table" "game-table" {
  hash_key = "id"
  name = "bingo-games"
  billing_mode = "PROVISIONED"
  write_capacity = 5
  read_capacity = 5
  attribute {
    name = "id"
    type = "S"
  }
}

resource "aws_dynamodb_table" "board-table" {
  hash_key = "id"
  name = "bingo-boards"
  billing_mode = "PROVISIONED"
  write_capacity = 5
  read_capacity = 5
  attribute {
    name = "id"
    type = "S"
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