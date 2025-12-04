library(tidyverse)
library(lubridate)
library(janitor)
library(glue)

otp_raw_1519 <- read_csv("data-raw/otp_2015_2019.csv", show_col_types = FALSE) |> 
  clean_names()

otp_raw_2024 <- read_csv("data-raw/otp_2020_2024.csv", show_col_types = FALSE) |> 
  clean_names()

# ---- Standardize one dataset ----
clean_otp <- function(df, period_label) {
  df |>
    clean_names() |>
    mutate(
      month_str = as.character(month),
      month_date = parse_date_time(
        month_str,
        orders = c("Y-m", "Y-m-d", "Ym", "Ymd")
      ),
      
      year   = year(month_date),
      period = period_label,
      
      day_type_label = case_when(
        day_type == 1 ~ "Weekday",
        day_type == 2 ~ "Weekend",
        TRUE ~ "Other"
      ),
      
      otp_pct   = terminal_on_time_performance,
      on_time   = num_on_time_trips,
      scheduled = num_sched_trips,
    ) |>
    select(
      line, division, day_type, day_type_label,
      month = month_str, month_date, year, period,
      otp_pct, on_time, scheduled
    )
}

otp_1519 <- clean_otp(otp_raw_1519, period_label = "2015-2019")
otp_2024 <- clean_otp(otp_raw_2024, period_label = "2020-2024")

otp_all <- bind_rows(otp_1519, otp_2024)

otp_all |> count(period)
otp_all |>
  summarise(min = min(month_date, na.rm = TRUE),
            max = max(month_date, na.rm = TRUE))


# save cleaned file
dir.create("data", showWarnings = FALSE)
write_csv(otp_all, "data/otp_clean.csv")
