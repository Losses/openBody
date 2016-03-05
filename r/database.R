db_check <- function(connection){
  query <- ps(readLines('./query/dbinit.sql'))
  query <- gsub('\t', ' ', query, fixed = T)
  query <- strsplit(query, ';')[[1]]
  
  for (.i in query){
    dbSendQuery(conn = connection, .i)
  }
}

new_read_machine <- function(sql_file, activities){
  db <- dbConnect(SQLite(), dbname = sql_file)
  db_check(db)
  
  a_summary <- read.csv(activities$Activity)
  a_list <- read.csv(activities$Daily)
  list(
    sql_file = sql_file,
    connection = db,
    Activity = a_summary,
    Daily = a_list
  )
}

close_machine <- function(machine){
  dbDisconnect(machine$connection)
}

open_machine <- function(machine){
  machine$connection <- dbConnect(SQLite(), dbname = machine$sql_file)
}

rebirth_machine <- function(machine){
  close_machine(machine)
  file.remove(machine$sql_file)
  
  db <- dbConnect(SQLite(), dbname = machine$sql_file)
  db_check(db)
  
  machine$connection <- db
  
  machine
}