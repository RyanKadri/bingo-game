resource "aws_sns_topic" "bingo-alarms" {

}

resource "aws_cloudwatch_metric_alarm" "board-table-capacity" {
  alarm_name = "bingo-table-capacity"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods = 1
  threshold = 25
  alarm_description = "Total Bingo capacity indicates higher usage"
  insufficient_data_actions = []


  metric_query {
    id = "total"
    expression = "read + write"
    label = "TotalBoardCapacity"
    return_data = true
  }

  metric_query {
    id = "read"
    metric {
      metric_name = "ConsumedReadCapacityUnits"
      period = 300
      stat = "Average"
      namespace = "AWS/DynamoDB"
      dimensions = {
        TableName = aws_dynamodb_table.board-table.name
      }
    }
  }

  metric_query {
    id = "write"
    metric {
      metric_name = "ConsumedReadCapacityUnits"
      period = 300
      stat = "Average"
      namespace = "AWS/DynamoDB"
      dimensions = {
        TableName = aws_dynamodb_table.board-table.name
      }
    }
  }
}