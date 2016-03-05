library(DBI)
library(RSQLite)
library(jsonlite)

gs <- function(x){
  paste(as.character(x) ,collapse = ',')
}

in_list <- function(x, list){
  regex <- sprintf('^%s$', x)
  length(grep(regex,names(list))) != 0
}

to_list <- function(df){
  apply(df, 1, as.list)
}

simpleify_logical <- function(x){
  return_data <- ''
  
  for (.i in x) {
    if (.i) this_char <- 'T' else this_char <- 'F'
    return_data <- sprintf('%s%s', return_data, this_char)
  }
  
  return_data
}

sql_safe <- function(chars){
  chars <- as.character(chars)
  chars <- gsub('\"', '\\\"', chars, fixed = T)
  chars <- gsub('\'', '\\\'', chars, fixed = T)
  chars <- sprintf('"%s"', chars)
  
  chars
}

generate_insert <- function(table, list){
  col_names <- names(list[[1]])
  list <- data.frame(matrix(sql_safe(unlist(list)), 
                            nrow = length(list), byrow = T),
                     stringsAsFactors = FALSE)
  
  colnames(list) <- col_names
  
  value_string <- gs(sprintf('(%s)', apply(list, 1, gs)))
  
  result <- sprintf('INSERT OR REPLACE INTO %s (%s) VALUES %s',
                    table, paste(sprintf('`%s`', col_names), collapse = ','),
                    value_string)
  
  result
}

to_num <- function(num){
  regex <- gregexpr("[0-9]+", num)
  as.numeric(unique(unlist(regmatches(num, regex))))
}

recover_date <- function(date){
  date <- to_num(date)
  format(as.POSIXlt(trunc(date/1000), origin = '1970-01-01'),
                   format = "%Y-%m-%d %H:%M:%S")
}

convert_csv_list <- function(handle, object, is_sleep = F){
  date <- object$date
  start_time <- object$date_d
  csv_data <- object$csv_data
  
  return_data <- list(
    date = to_num(date),
    start_time = start_time,
    duration = csv_data[,'Duration_Seconds'][1],
    calories_burned = csv_data[,'Calories_Burned'][1],
    HR_lowest = csv_data[,'HR_Lowest'][1],
    HR_peak = csv_data[,'HR_Peak'][1],
    HR_average = csv_data[,'HR_Average'][1],
    data_source = 'MS'
  )
  
  if (is_sleep) {
    add_data <- list(
      wake_up_time = csv_data[,'Wake_Up_Time'][1],
      seconds_awake = csv_data[,'Seconds_Awake'][1],
      seconds_asleep_total = csv_data[,'Seconds_Asleep_Total'][1],
      seconds_asleep_restful = csv_data[,'Seconds_Asleep_Restful'][1],
      seconds_asleep_light = csv_data[,'Seconds_Asleep_Light'][1],
      wake_ups = csv_data[,'Wake_Ups'][1],
      seconds_to_fall_asleep = csv_data[,'Seconds_to_Fall_Asleep'][1],
      sleep_efficiency = csv_data[,'Sleep_Efficiency'][1],
      sleep_restoration = csv_data[,'Sleep_Restoration'][1],
      sleep_HR_resting = csv_data[,'Sleep_HR_Resting'][1],
      sleep_auto_detect = csv_data[,'Sleep_Auto_Detect'][1]
    )
  } else {
    add_data <- list(
      seconds_paused = csv_data[,'Seconds_Paused'][1],
      calories_burned_carbs = csv_data[,'Calories_Burned_Carbs'][1],
      calories_burned_fats = csv_data[,'Calories_Burned_Fats'][1],
      cardio_benefit = csv_data[,'Cardio_Benefit'][1],
      HR_invalid_min = csv_data[,'Minutes_Under_50._HR'][1],
      HR_very_light_min = csv_data[,'Minutes_In_HRZ_Very_Light_50._60.'][1],
      HR_light_min = csv_data[,'Minutes_In_HRZ_Light_60._70.'][1],
      HR_moderate_min = csv_data[,'Minutes_In_HRZ_Moderate_70._80.'][1],
      HR_hard_min = csv_data[,'Minutes_In_HRZ_Hard_80._90.'][1],
      HR_very_hard_min = csv_data[,'Minutes_In_HRZ_Very_Hard_90._Plus'][1],
      HR_finish = csv_data[,'HR_Finish'][1],
      HR_recovery_1_min = csv_data[,'HR_Recovery_Rate_1_Min'][1],
      HR_recovery_2_min = csv_data[,'HR_Recovery_Rate_2_Min'][1],
      recovery_time_seconds = csv_data[,'Recovery_Time_Seconds'][1]
    )
  }
  append(return_data, add_data)
}

write_result <- function(pipe, walk_result) {
  for (.table_name in names(walk_result)) {
    if (.table_name == 'Guided workout') ._table_name <- 'Exercise'
    else ._table_name <- .table_name
    
    query <- generate_insert(._table_name, walk_result[[.table_name]])
    dbSendQuery(conn = pipe$connection,query)
  }
}

get_csv_line <- function(pipe, object){
  date <- object$StartDate
  date_d <- recover_date(date)
  
  csv_data <- pipe$Activity[pipe$Activity[,'Start_Time'] == date_d, ]
  
  list(
    date = date,
    date_d = date_d,
    csv_data = csv_data
  )
}

read_run <- function(handle, pipe, object){
  csv_data <- get_csv_line(pipe, object)
  csv_pure <- csv_data$csv_data

  pace <- as.data.frame(object$PaceData)[, c('Distance', 'Value')]
  colnames(pace) <-  c('distance_rule', 'pace_data')
  
  hr <- as.data.frame(object$HeartRateData)[, c('Distance', 'Value', 'ElapsedSeconds')]
  colnames(hr) <- c('distance_rule', 'HR_data', 'time_rule')
  
  elevation <- as.data.frame(object$ElevationData)[, c('Distance', 'Value')]
  colnames(elevation) <- c('distance_rule', 'elevation_data')
  
  json_data <- merge(pace, hr, by = 'distance_rule')
  json_data <- merge(json_data, elevation, by = 'distance_rule')

  sql_result <- list(
    UV = object$UVExposure,
    UV_exposure_seconds = object$UVExposureInSeconds,
    distance = max(json_data[,'distance_rule']),
    elevation_highest_meters = csv_pure[,'Elevation_Highest_Meters'][1],
    elevation_lowest_meters = csv_pure[,'Elevation_Lowest_Meters'][1],
    elevation_gain_meters = csv_pure[,'Elevation_Gain_Meters'][1],
    elevation_loss_meters = csv_pure[,'Elevation_Loss_Meters'][1],
    distance_rule = gs(json_data[,'distance_rule']),
    time_rule = gs(json_data[,'time_rule']),
    pace_data = gs(json_data[,'pace_data']),
    HR_data = gs(json_data[,'HR_data']),
    elevation_data = gs(json_data[,'elevation_data']),
    split_distance = gs(object$Splits[[1]][,'Distance']),
    split_pace = gs(object$Splits[[1]][,'Pace']),
    split_HR = gs(object$Splits[[1]][,'Pace'])
  )
  
  append(sql_result, convert_csv_list(handle, csv_data))
}

read_exercise <- function(handle, pipe, object){
  csv_data <- get_csv_line(pipe, object)
  
  HR_data <- gs(as.data.frame(
                      object$HeartRateChartData
                      )[, 'AverageHeartRate'])
  
  if (in_list('Name',object) & !is.na(object$Name)) 
    comment <- sprintf('MsGw:%s', object$Name)
  else
    comment <- ''
  
  
  sql_result <- list(
    UV = object$UVExposure,
    UV_exposure_seconds = object$UVExposureInSeconds,
    HR_data = HR_data,
    comment = comment
  )
  
  sql_result <- append(sql_result, convert_csv_list(handle, csv_data))
  
  sql_result
}

read_sleep <- function(handle, pipe, object){
  csv_data <- get_csv_line(pipe, object)
  
  sequences <- as.data.frame(object$Sequences)
  HR <- as.data.frame(object$HeartRateChartData)
  
  sql_result <- list(
    bed_time_goal_met = as.character(object$BedTimeGoalMet),
    wake_up_time_goal_met = as.character(object$WakeUpTimeGoalMet),
    
    sequences_start = gs(to_num(sequences[,'StartDate'])),
    sequences_end = gs(to_num(sequences[,'EndDate'])),
    sequences_type = gs(to_num(sequences[,'SequenceType'])),
    sleep_type = gs(to_num(sequences[,'SleepType'])),
    
    HR_duration =  gs(to_num(HR[,'Duration'])),
    HR_data = gs(to_num(HR[,'AverageHeartRate']))
  )
  
  append(sql_result, convert_csv_list(handle, csv_data, T))
}

read_daily <- function(handle, pipe, object){
  object <- fromJSON(object)

  date <- format(as.POSIXlt(trunc(as.Date(object$LocalizedDate, "%A, %B %d, %Y")),
                            origin = '1970-01-01'), format = "%Y-%m-%d")

  sql_result <- to_list(pipe$Daily[pipe$Daily[, 'Date'] == date,])[[1]]
  
  sql_result$Date <- (as.numeric(strptime(date, "%Y-%m-%d")) - 3600 * handle$utc) * 1000
  sql_result$Total_Kilometers_Moved <- NULL
  
  activity_list <- as.data.frame(object$ActivityList)

  sql_append <- list(
    calories_goal = object$CaloriesGoal,
    steps_goal = object$StepsGoal,
    total_distance = object$TotalDistance,
    total_distance_on_foot = object$TotalDistanceOnFoot,

    steps_data = gs(activity_list[, 'StepsTaken']),
    calories_data = gs(activity_list[, 'CaloriesBurned']),
    HR_data = gs(activity_list[, 'AverageHeartRate']),
    distance_data = gs(activity_list[, 'TotalDistance']),
    steps_active_data = simpleify_logical(activity_list[, 'IsStepsActiveTime']),
    calories_active_data = simpleify_logical(activity_list[, 'IsCaloriesActiveTime']),
    floors_data = gs(activity_list[, 'FloorsClimbed']),
    UV_data = gs(activity_list[, 'UVExposure']),
      
    data_source = 'MS',
    comment = ''
  )
  
  append(sql_result, sql_append)
}

extract_json_object <- function(object, name){
  return_object <- list()
  for (row in rownames(object[[name]]))
    return_object <- append(return_object, list(as.list(object[[name]][row, ])))

  return_object
}

read_band_json <- function(handle, pipe, file, type){
  object <- fromJSON(file)
  sql_object <- list()
  
  object_head_name <- switch(type,
                             Run = 'Runs', 
                             `Guided workout` = 'Workouts',
                             Exercise = 'Workouts',
                             Sleep = 'SleepSessions')
  
  if (!in_list(object_head_name, object))
    stop(sprintf('File does not fit the type para: \n%s', file))
  
  object <- extract_json_object(object, object_head_name)
  for (.i in 1:length(object)) {
    .sql_object <- switch(object_head_name,
                         Runs = read_run(handle, pipe, object[[.i]]),
                         Workouts = read_exercise(handle, pipe, object[[.i]]),
                         SleepSessions = read_sleep(handle, pipe, object[[.i]]))
    
    sql_object <- append(sql_object, list(.sql_object))
  }
  
  sql_object
}

walk_activity_list <- function(handle, pipe, json_list){
  cat('Reading activity list. \n')
  sql_list <- list()
  
  for (.i in names(json_list)) {
    .this_list <- list()
    for (.file in json_list[[.i]]) {
      if (.i == 'Daily') 
        .this_list <- append(.this_list,
                             list(read_daily(handle, pipe, .file)))
      else
        .this_list <- append(.this_list,
                             read_band_json(handle, pipe, .file, .i))
      
      names(.this_list)
    }
    
    sql_list[[.i]] <- .this_list
  }
  
  sql_list
}

clear_list <- function(activities){
  file.remove(as.character(activities))
}