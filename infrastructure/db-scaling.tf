resource "aws_appautoscaling_target" "read-targets" {
  for_each = tomap({
    boards = {
      name = "table/${aws_dynamodb_table.board-table.name}"
      scalable = "dynamodb:table:ReadCapacityUnits"
    }
    games = {
      name = "table/${aws_dynamodb_table.game-table.name}"
      scalable = "dynamodb:table:ReadCapacityUnits"
    }
    players = {
      name = "table/${aws_dynamodb_table.player-table.name}"
      scalable = "dynamodb:table:ReadCapacityUnits"
    }
    playerConnectionInd = {
      name = "table/${aws_dynamodb_table.player-table.name}/index/${aws_dynamodb_table.player-table.global_secondary_index.*.name[0]}"
      scalable = "dynamodb:index:ReadCapacityUnits"
    }
  })
  max_capacity = 100
  min_capacity = 5
  resource_id = each.value.name
  scalable_dimension = each.value.scalable
  service_namespace = "dynamodb"
}

resource "aws_appautoscaling_target" "write-targets" {
  for_each = tomap({
    boards = {
      name = "table/${aws_dynamodb_table.board-table.name}"
      scalable = "dynamodb:table:WriteCapacityUnits"
    }
    games = {
      name = "table/${aws_dynamodb_table.game-table.name}"
      scalable = "dynamodb:table:WriteCapacityUnits"
    }
    players = {
      name = "table/${aws_dynamodb_table.player-table.name}"
      scalable = "dynamodb:table:WriteCapacityUnits"
    }
    playerConnectionInd = {
      name = "table/${aws_dynamodb_table.player-table.name}/index/${aws_dynamodb_table.player-table.global_secondary_index.*.name[0]}"
      scalable = "dynamodb:index:WriteCapacityUnits"
    }
  })
  max_capacity = 100
  min_capacity = 5
  resource_id = each.value.name
  scalable_dimension = each.value.scalable
  service_namespace = "dynamodb"
}

resource "aws_appautoscaling_policy" "table-read-policies" {
  for_each = aws_appautoscaling_target.read-targets
  name               = "bingo-read-capacity-utilization-${each.value.resource_id}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = each.value.resource_id
  scalable_dimension = each.value.scalable_dimension
  service_namespace  = each.value.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "DynamoDBReadCapacityUtilization"
    }
    target_value = 70
  }
}

resource "aws_appautoscaling_policy" "table-write-policies" {
  for_each = aws_appautoscaling_target.write-targets
  name               = "bingo-write-capacity-utilization-${each.value.resource_id}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = each.value.resource_id
  scalable_dimension = each.value.scalable_dimension
  service_namespace  = each.value.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "DynamoDBWriteCapacityUtilization"
    }
    target_value = 70
  }
}
