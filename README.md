# exchange-rates-parser

This parser can fetch and parse daily exchange rates between two currencies for a specific time period by scraping historical rates from [FXTOP](https://fxtop.com/en/historical-exchange-rates.php).

## Usage

    node index.js -b BASE_CURRENCY -t TARGET_CURRENCY -s START_DATE -e END_DATE

## Options

    --baseCurrency      -b  3-letter code for the currency that needs to be converted
    --targetCurrency    -t  3-letter code for the currency to convert to
    --startDate         -s  First day for which exchange rates should be obtained (format: YYYY-mm-dd)
    --endDate           -e  Last day for which exchange rates should be obtained (format: YYYY-mm-dd)

## Output

The script outputs the exchange rate for each day in a separate CSV line. Columns are: base currency code, target currency code, date, and exchange rate. This corresponds to the following logic: to convert from base currency to target currency, multiply by exchange rate.

## Notes

This script performs a basic web scraping of the Historical Rates page from FXTOP, which is a paid service. The script is limited to parsing one URL per use and it is discouraged to modify it to scrape more than one URL (for example, attempting to scrape FXTOP's entire database). Such use of this script has not been tested and is strongly advised against.

Another caveat is that FXTOP will only return average monthly exchange rates when the start date and end date are too far apart. The script has been tested and retrieves daily exchange rates correctly for intervals up to one year (for example, 2020-01-01 to 2020-12-31).
