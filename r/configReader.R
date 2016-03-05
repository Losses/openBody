library(jsonlite)

config <- fromJSON('../config.json')

username <- config$account$mshr$username
password <- config$account$mshr$password

dely <- config$syncDaysDely
UTC <- config$UTC
SSL_disable <- config$disableSSLVerify
date_from <- config$dateFrom