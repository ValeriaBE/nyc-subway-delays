library(tidyverse)
library(janitor)

dir.create("data-raw", showWarnings = FALSE)

# Helper function to download & save a Socrata CSV
download_socrata_csv <- function(dataset_id, file_out) {
  url <- glue::glue(
    "https://data.ny.gov/resource/{dataset_id}.csv?$limit=50000"
  )
  
  message("Downloading ", dataset_id, " ...")
  readr::read_csv(url, show_col_types = FALSE) |>
    janitor::clean_names() |>
    write_csv(file_out)
}

# 2015–2019 OTP
download_socrata_csv(
  dataset_id = "f6rf-2a3t",
  file_out   = "data-raw/otp_2015_2019.csv"
)

# 2020–2024 OTP
download_socrata_csv(
  dataset_id = "vtvh-gimj",
  file_out   = "data-raw/otp_2020_2024.csv"
)
