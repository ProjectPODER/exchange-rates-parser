const commandLineArgs = require('command-line-args');
const puppeteer = require("puppeteer");
const CSV = require('csv-string');

const optionDefinitions = [
    { name: 'baseCurrency', alias: 'b', type: String },     // 3-letter currency code
    { name: 'targetCurrency', alias: 't', type: String },   // 3-letter currency code
    { name: 'startDate', alias: 's', type: String },        // format: YYYY-mm-dd
    { name: 'endDate', alias: 'e', type: String }           // format: YYYY-mm-dd
];
const args = commandLineArgs(optionDefinitions);

// Check args:
if(args.baseCurrency.length !== 3 || args.targetCurrency.length !== 3) {
    console.error('Error: currencies should be 3-letter codes. Invalid codes supplied.');
    process.exit(1);
}
let dateFormat = /\d{4}\-\d{2}\-\d{2}/
if( !args.startDate.match(dateFormat) || !args.endDate.match(dateFormat) ) {
    console.error('Error: incorrect date format. Expecting YYYY-mm-dd.');
    process.exit(2);
}

let start = args.startDate.split('-');
let end = args.endDate.split('-');
let base = args.baseCurrency.toUpperCase();
let target = args.targetCurrency.toUpperCase();

// Build base URL for exchange rates. Only one URL should be requested per script execution, do not abuse the website
const baseURL = 'https://fxtop.com/en/historical-exchange-rates.php?A=1&C1=' + base + '&C2=' + target + '&DD1=' + start[2] + '&MM1=' + start[1] + '&YYYY1=' + start[0] + '&B=1&P=&I=1&DD2=' + end[2] + '&MM2=' + end[1] + '&YYYY2=' + end[0];

getRates(baseURL)
.then( table => {
    let results = []
    if(table.length > 0) {
        table.map( row => {
            if(row !== null) {
                let date = row[0];
                let conversion = row[1];
                results.push( [ base, target, convertDate(date), conversion ] )
            }
        } );

        results.map( result => {
            process.stdout.write(CSV.stringify( result ));
        } );

        process.exit(0);
    }
    else {
        console.error('Error: empty result.');
        process.exit(4);
    }

    console.log(result);
    console.log('Stopping.');
    process.exit(0);
} );

async function getRates(baseURL) {
    try {
        var browser = await puppeteer.launch({ headless: true });
        var page = await browser.newPage();
        await page.goto(baseURL);

        let table = await getTable(page);
        await browser.close();

        return table;
    }
    catch (err) {
        console.log(err);
        process.exit(3);
    }
}

async function getTable(browserPage) {
    let cssPath = 'body > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(9) > td:nth-child(1) > table:nth-child(2) > tbody:nth-child(1) tr';
    return browserPage.$$eval(cssPath, trs => trs.map((tr, j) => {
        if(j > 0) {
            const tds = [...tr.getElementsByTagName('td')];
            return tds.map((td, i) => {
                switch(i) {
                    case 0:
                    case 1:
                        return td.textContent.trim();
                }
            });
        }
    }));
}

function convertDate(string) {
    // Receives string with format: Weekday dd MonthName YYYY
    let parts = string.split(' ');
    return parts[3] + '-' + getMonth(parts[2]) + '-' + parts[1];
}

function getMonth(monthName) {
    switch(monthName) {
        case 'January': return '01';
        case 'February': return '02';
        case 'March': return '03';
        case 'April': return '04';
        case 'May': return '05';
        case 'June': return '06';
        case 'July': return '07';
        case 'August': return '08';
        case 'September': return '09';
        case 'October': return '10';
        case 'November': return '11';
        case 'December': return '12';
    }
}
