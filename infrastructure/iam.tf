data "aws_iam_policy_document" "general-lambda-assume" {
  statement {
    actions = [
      "sts:AssumeRole"
    ]
    principals {
      identifiers = ["lambda.amazonaws.com"]
      type = "Service"
    }
  }
}

data "aws_iam_policy" "aws-basic-lambda-policy" {
  arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "bingo-tables" {
  statement {
    effect = "Allow"
    actions = [
      "dynamodb:BatchGetItem",
      "dynamodb:BatchWriteItem",
      "dynamodb:PutItem",
      "dynamodb:DescribeTable",
      "dynamodb:DeleteItem",
      "dynamodb:GetItem",
      "dynamodb:Scan",
      "dynamodb:Query",
      "dynamodb:UpdateItem"
    ]
    resources = [
      aws_dynamodb_table.board-table.arn,
      aws_dynamodb_table.game-table.arn,
      aws_dynamodb_table.player-table.arn,
      "${aws_dynamodb_table.player-table.arn}/index/*"
    ]
  }
}

resource "aws_iam_policy" "bingo-tables-policy" {
  name = "bingo-tables"
  policy = data.aws_iam_policy_document.bingo-tables.json
}

resource "aws_iam_role" "bingo-lambda-role" {
  name = "bingo-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.general-lambda-assume.json
}

resource "aws_iam_role_policy_attachment" "general-lambda-attachment" {
  policy_arn = data.aws_iam_policy.aws-basic-lambda-policy.arn
  role = aws_iam_role.bingo-lambda-role.name
}

resource "aws_iam_role_policy_attachment" "bingo-table-attachment" {
  role = aws_iam_role.bingo-lambda-role.name
  policy_arn = aws_iam_policy.bingo-tables-policy.arn
}
