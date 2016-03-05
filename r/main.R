cat('Updating the Open Body database... \n')

setwd(commandArgs(trailingOnly = TRUE)[1])

source('configReader.R')

source('login.R')
source('database.R')
source('readActivities.R')

db_location <- '../app/data.db'
opt <- list(ssl.verifypeer = !SSL_disable)

if (file.exists(db_location)){
  db <- dbConnect(SQLite(), dbname = db_location)
  date <- dbGetQuery(db, 'SELECT cast(MAX(`date`) as real) from `daily`')
  date_from <- format(as.POSIXlt(as.numeric(date/1000), origin = '1970-01-01'), format = "%Y-%m-%d")
  dbDisconnect(db)
  rm(db, date)
}

handle <- login(username, password, UTC, '../cache', .opts = opt)
activities <- fetch_activity_list(handle, date_from, dely = dely)

json_list <- fetch_activities(handle, activities)
machine <- new_read_machine(db_location, activities)
sql <- write_result(machine, 
                    walk_activity_list(handle, machine, json_list))
clear_list(activities)
close_machine(machine)

#machine <- rebirth_machine(machine)
