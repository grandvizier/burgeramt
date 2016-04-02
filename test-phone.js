/*

when switching to use a new number, run this to confirm it's working
It's likely that you need to add the number to:
    twilio.com/user/account/phone-numbers/verified
*/
var auth = require('./auth.json');
var twilio = require('twilio')(auth.AccountSID, auth.AuthToken);

msg = "\n\nTest message from Bürgeramt App \n:)";

twilio.sendMessage({
      to: auth.to,
      from: auth.from,
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
