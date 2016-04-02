var webdriver = require('selenium-webdriver');
var sites = require('./sites.json');
var auth = require('./auth.json');
var twilio = require('twilio')(auth.AccountSID, auth.AuthToken);

var termin_types = {
    'fahrerlaubnis': '121598',
    'wohnung': '120686',
    'ersatzführerschein': '121593',
    'neue-fahrerlaubnis': '121637'
}
var acceptable_dates = {
    'Apr': 30,
    'Mai': 31
}

/*
Places:
    https://service.berlin.de/standorte/buergeraemter/
*/

var baseUrl = 'https://service.berlin.de/terminvereinbarung/termin/tag.php?termin=1&dienstleister=';
var path = '.calendar-table .row-fluid td.buchbar';
var noAppointments = '.calendar-table .row-fluid td.nichtbuchbar';
var monthXPath = '../../parent::table/thead//th[@class="month"]';
var nextMonthPath = 'a[title="nächster Monat"]';

var driver = new webdriver.Builder().
    usingServer('http://127.0.0.1:4444/wd/hub').
    withCapabilities(webdriver.Capabilities.phantomjs()).
    build();

console.log('------');
console.log(new Date());
for (var i = 0; i < sites.length; i++) {
    var url = baseUrl + sites[i].dienstleister + "&anliegen%5B%5D=" + termin_types['neue-fahrerlaubnis'];
    checkSite(url, sites[i].name);
};
console.log('');

driver.quit();


function checkSite(siteUrl, name){
    driver.get(siteUrl);
    var msg = name + " has ";
    var openings = 0;
    var days = '';
    driver.findElements(webdriver.By.css(noAppointments)).then(function(full) {
        if (full.length == 0){
            driver.findElement(webdriver.By.css('body')).getText().then(function(reason) {
                if (reason.indexOf("Es gibt keinen Standort, der alle ausgewählten Dienstleistungen anbietet.") > 0) {
                    console.log('No openings for: ', name);
                    return;
                } else if (reason.indexOf("Bitte wählen Sie ein Datum") < 0) {
                    console.log(name + ' unavailable: ', reason.substring(0,150));
                    exit();
                }
            });
        }
    });
    driver.findElements(webdriver.By.css(path)).then(function(elements) {
        openings = elements.length;
        msg += openings + " openings";
        errHandling = function (err) {
            console.log("meh\n", err);
            console.log("\n------\n");
        }
        if (openings > 0){
            console.log('Found openings for ', name, openings);
            for (var i = 0; i < openings; i++) {
                elements[i].findElement(webdriver.By.xpath(monthXPath)).getText().then(function(m) {
                   month = m.substring(0,3);
                }, errHandling);
                elements[i].getText().then(function(d) {
                    if (d <= acceptable_dates[month]) {
                        days += month + ' ' + d + "\n";
                    }
                }, errHandling);
                if (i > 3){
                    break;
                }
            }
        } else {
            // // check `next` month
            // // FOR NOW, `NEXT` MONTH ISN'T IMPORTANT
            // driver.findElements(webdriver.By.css(nextMonthPath)).then(function(links) {
            //     // put this in a try/catch???
            //     links[links.length - 1].click();
            // }, errHandling);
            // driver.findElements(webdriver.By.css(path)).then(function(newElements) {
            //     openings = newElements.length;
            // }, errHandling)
        }
    }).then(function(){
        // TODO need to also check if the days are acceptable
        if (openings > 0) {
            msg += ' on: ' + days;
            sendSMS(siteUrl, msg);
        }
    });
}

function sendSMS(url, msg){
    var lb = "\n";
    msg = lb + "site: " + lb + url + lb + lb + msg;

    twilio.sendMessage({
        to: auth.to,
        from: auth.from, // A number you bought from Twilio and can use for outbound communication
        body: msg
    }, function(err, responseData) {
        if (!err) {
            console.log(responseData.from);
            console.log(responseData.body);
        } else {
            console.log('CRAP !!!!');
            console.log(err);
        }

    });
}

function exit(){
    console.log('--Exiting early--');
    driver.quit();
    process.exit();
}
