var webdriver = require('selenium-webdriver');
var sites = require('./sites.json');
var auth = require('./auth.json');
var twilio = require('twilio')(auth.AccountSID, auth.AuthToken);

var baseUrl = 'https://service.berlin.de/terminvereinbarung/termin/tag.php?termin=1&anliegen%5B%5D=120686&dienstleister=';
var path = '.calendar-table .row-fluid td.buchbar';

var driver = new webdriver.Builder().
   withCapabilities(webdriver.Capabilities.firefox()).
   build();

for (var i = 0; i < sites.length; i++) {
    var url = baseUrl + sites[i].dienstleister;
    checkSite(url, sites[i].name);
};

driver.quit();


function checkSite(siteUrl, name){
    driver.get(siteUrl);
    driver.findElements(webdriver.By.css(path)).then(function(elements) {
      if (elements.length > 0){
          sendSMS(siteUrl, name, elements.length);
      }
    });
}

function sendSMS(url, name, openings){
    var lb = "\n";
    var msg = name + " has " + openings + " openings";
    console.log(msg);
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