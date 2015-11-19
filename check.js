var webdriver = require('selenium-webdriver');
var sites = require('./sites.json');
var auth = require('./auth.json');
var twilio = require('twilio')(auth.AccountSID, auth.AuthToken);

var baseUrl = 'https://service.berlin.de/terminvereinbarung/termin/tag.php?termin=1&anliegen%5B%5D=120686&dienstleister=';
var path = '.calendar-table .row-fluid td.buchbar';
var noAppointments = '.calendar-table .row-fluid td.nichtbuchbar';
var monthXPath = '../../parent::table/thead//th[@class="month"]';

var driver = new webdriver.Builder().
    usingServer('http://127.0.0.1:4444/wd/hub').
    withCapabilities(webdriver.Capabilities.phantomjs()).
    build();

console.log('------');
console.log(new Date());
for (var i = 0; i < sites.length; i++) {
    var url = baseUrl + sites[i].dienstleister;
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
                console.log(name + ' unavailable: ', reason);
                exit();
            });
        }
    });
    driver.findElements(webdriver.By.css(path)).then(function(elements) {
        openings = elements.length;
        msg += openings + " openings";
        if (openings > 0){
            for (var i = 0; i < openings; i++) {
                try{
                    elements[i].getText().then(function(d) {
                        elements[i].findElement(webdriver.By.xpath(monthXPath)).getText().then(function(m) {
                            days += m.substring(0,3) + ' ' + d + "\n";
                        });
                    });
                    if (i > 3){
                        break;
                    }
                } catch (e) {
                    console.log('meh', e);
                }
            }
        }
    }).then(function(){
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
