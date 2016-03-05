library(RCurl)

find_between <- function(x, a, b){
  str <- strsplit(x, a)[[1]][2]
  str <- strsplit(str, b)[[1]][1]
  str
}

two_step_find <- function(x, a, b, c, d){
  str <- find_between(x, a, b)
  str <- find_between(str, c, d)
  str
}

rand_string <- function(n=1, lenght=20){
  randomString <- c(1:n)
  for (i in 1:n) {
    randomString[i] <- paste(sample(c(0:9, letters, LETTERS),
                             lenght, replace = TRUE),collapse = "")
  }
  
  return(randomString)
}

jar_location <- function(){
  tempfile(pattern = "file", tmpdir = tempdir(), fileext = "")
}

ps <- function(x){
  paste(x, collapse = '')
}

format_date <- function(x){
  paste(strsplit(x, '-')[[1]], collapse = '')
}

login <- function(username, password, utc = 8, cache_dir = '%%SYSTEM_DEFAULT%%',
                  year = as.numeric(format(Sys.Date(), format = "%Y")), ...){
  #get login page and set cookiejar
  cat('Getting Login page. \n')
  header <- basicHeaderGatherer()
  .page <- getURI('https://dashboard.microsofthealth.com', headerfunction = header$update, ...)
  login_url <- header$value()[['Location']]
  header$reset()
  cat('Setting up the cookiejar. \n')
  jar <- jar_location()
  #get data submit page
  cat('Getting the login form. \n')
  handle <- getCurlHandle()
  curlSetOpt(cookiejar = jar, followlocation = TRUE, curl = handle)
  .page <- getURI(login_url, headerfunction = header$update, curl = handle, ...)
  submit_url <- find_between(.page, 'B:false,urlPost:\'', '\'')
  PPFT <- find_between(.page, 'sFTTag:\'<input type="hidden" name="PPFT"', '"/>')
  PPFT <- strsplit(PPFT, 'value="')[[1]][2]
  #submit login information
  cat('Sending the user information. \n')
  post_body <- list(
    loginfmt = username, login = username, passwd = password,
    type = 11,           PPFT = PPFT,      PPSX = 'Passport',
    idsbho = 1,          sso = 0,          NewUser = 1,
    LoginOptions = 3,    i2 = 1,           i4 = 0,
    i7 = 0,              i12 = 1,          i13 = 0, 
    i17 = 0,             i18 = '__Login_Strings|1,__Login_Core|1,'
  )
  .page <- postForm(submit_url, .params = post_body, curl = handle, ...)
  #get the last cookies
  cat('Getting the last cookies. \n')
  submit_url <- two_step_find(.page, '<form', '>', 'action="', '"')
  post_body <- list(
    NAP = find_between(.page, 'id="NAP" value="', '">'),
    ANON = find_between(.page, 'id="ANON" value="', '">'),
    t = find_between(.page, 'id="t" value="', '">')
  )
  .page <- postForm(submit_url, .params = post_body, curl = handle, ...)
  .page <- getURI('https://dashboard.microsofthealth.com/', curl = handle, ...)
  .page <- getURI('https://dashboard.microsofthealth.com/Home/Dst', curl = handle, ...)
  url <- ps(c(
    'https://dashboard.microsofthealth.com/home/dst?&dst1=', year + 1,
    '-01-01T00:00:00&offset1=', utc * 60, '&dst2=', 
    year, '-01-01T00:00:00&offset2=',  utc * 60
  ))
  .page <- getURI(url, curl = handle, ...)
  #Create template folder
  if (cache_dir == '%%SYSTEM_DEFAULT%%') {
    cache_dir <- ps(c(tempdir(), '\\', rand_string()));
    dir.create(cache_dir)
  }
  
  list(
    handle = handle,
    utc = utc,
    cache_dir = cache_dir
  )
}

fetch_activity_list <- function(x, from, to = '%%LAST_DAY%%', dely = 2, force = F){
  cat('Fetching activity list. \n')
  if (to == '%%LAST_DAY%%') to <- format(Sys.Date() - dely, format = "%Y-%m-%d")
  
  handle <- x[['handle']]
  
  zip_location <- sprintf('%s\\%s_%s_package.zip', x[['cache_dir']], from, to);
  
  if (!file.exists(zip_location) || force) {
    url <- ps(c(
      'https://dashboard.microsofthealth.com/export/download?format=csv&dateFrom=',
      from, '&dateTo=', to, '&types=sleeping&types=running&types=biking&', 
      'types=workout&types=guidedworkout&types=golf&includeDailySummary=true'
    ))
    
    file <- file(zip_location, 'wb')
    binary <- getBinaryURL(url = url, curl = handle)
    writeBin(binary, file)
    close(file)
    
    unzip(zip_location, exdir = x[['cache_dir']])
  } else {
    cat('Notice: Package exists in cache folder.\n')
  }
  
  dirlist <- list.files(path = x[['cache_dir']])
  
  regfmt <- function(type){
    sprintf('%s\\S*_%s_%s', type, format_date(from), format_date(to)) 
  }
  
  listfmt <- function(type){
    sprintf('%s\\%s', x[['cache_dir']], dirlist[grep(regfmt(type), dirlist, perl = T)])
  }
  
  list(
    package = zip_location,
    Activity = listfmt('Activity'),
    Daily = listfmt('Daily')
  )
}

get_available_date <- function(x){
  activity_list <- read.csv(x[['Activity']])
  daily_summary <- read.csv(x[['Daily']])
  return_data <- list(
    Exercise = NA,
    `Guided workout` = NA,
    Run = NA,
    Sleep = NA,
    Daily = NA
  )
  for (.activity in c('Exercise', 'Guided workout', 'Run', 'Sleep')) {
    return_data[[.activity]] <- as.character(
      activity_list[activity_list['Event_Type'] == .activity, 'Date'])
  }
  
  return_data[['Daily']] <- as.character(
    daily_summary[daily_summary['Calories'] != 0, 'Date'])
  
  return_data
}

fetch_single_activity <- function(x, date, type){
  cat(sprintf('Fetching %s, %s. \n', type, date))
  utc <- x[['utc']]
  handle <- x[['handle']]
  
  url <- switch(type,
                Exercise = 'https://dashboard.microsofthealth.com/summary/workoutsdetail',
                `Guided workout` = 'https://dashboard.microsofthealth.com/summary/guidedworkoutsdetail',
                Run = 'https://dashboard.microsofthealth.com/summary/dailyrunsdetail',
                Sleep = 'https://dashboard.microsofthealth.com/summary/dailysleepdetails',
                Daily = 'https://dashboard.microsofthealth.com/card/getuseractivitybyhour'
  )
  
  url <- ps(c(
    url, '?date=', date, '&utcOffsetMinutes=', utc * 60
  ))
  
  getURI(url, curl = handle)
}

fetch_activities <- function(handle, activities, force = F){
  available_date <- get_available_date(activities)
  local_cache_location <- list()
  for (.activity_type in names(available_date)) {
    for (.activity_date in available_date[[.activity_type]]) {
      file_location <- ps(c(
        handle[['cache_dir']], '\\', .activity_type, '_', .activity_date, '.json'))
      if (file.exists(file_location)) next
      file <- file(file_location, 'wb')
      write(fetch_single_activity(handle, .activity_date, .activity_type), file)
      close(file)
    }
    
    local_cache_location[[.activity_type]] <- sprintf('%s\\%s_%s.json',
                                                      handle[['cache_dir']],
                                                      .activity_type,
                                                      available_date[[.activity_type]])
  }
  
  local_cache_location
}
