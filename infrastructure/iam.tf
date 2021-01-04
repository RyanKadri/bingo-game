data "aws_iam_role" "sample-role" {
  name = "step-functions-role"
}

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

data "aws_iam_policy_document" "workflow-updater" {
  statement {
    effect = "Allow"
    actions = [
      "states:DescribeStateMachineForExecution",
      "states:DescribeStateMachine",
      "states:DescribeExecution",
      "states:ListExecutions",
      "states:GetExecutionHistory",
      "states:ListTagsForResource"
    ]
    resources = [
      "${ aws_sfn_state_machine.sample-state-machine.arn }:*",
      aws_sfn_state_machine.sample-state-machine.arn
    ]
  }
  statement {
    effect = "Allow"
    actions = [
      "states:SendTaskSuccess",
      "states:SendTaskFailure",
      "states:SendTaskHeartbeat"
    ]
    resources = [
      "*"
    ]
  }
}

resource "aws_iam_policy" "workflow-updater" {
  name = "workflow-updater"
  policy = data.aws_iam_policy_document.workflow-updater.json
}

resource "aws_iam_role" "general-lambda-role" {
  name = "step-functions-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.general-lambda-assume.json
}

resource "aws_iam_role_policy_attachment" "general-lambda-attachment" {
  policy_arn = data.aws_iam_policy.aws-basic-lambda-policy.arn
  role = aws_iam_role.general-lambda-role.name
}

resource "aws_iam_role_policy_attachment" "workflow-updater" {
  policy_arn = aws_iam_policy.workflow-updater.arn
  role = aws_iam_role.general-lambda-role.name
}