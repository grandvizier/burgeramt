# Bürgeramt
a script to check the Bürgeramt for available appt times, and send an sms when there is an opening


## Configure to run on Linux server
* install git, node, npm, java8
  ```
  sudo add-apt-repository ppa:webupd8team/java
  sudo apt-get update
  sudo apt-get install git nodejs npm oracle-java8-installer
  sudo ln -s `which nodejs` /usr/bin/node
  ```

* git clone *this repo*

* download selenium

  `wget --max-redirect 5 -O selenium-server-standalone-2.48.2.jar http://goo.gl/PJUZfa`

* `npm install`

* map phantom

  *(check with `phantomjs -v`)*
  *might need to install `git-lfs-linux-amd64-1.0.2`*

  ```
  sudo ln libs/phantomjs /usr/local/bin/phantomjs
  sudo ln libs/phantomjs /usr/local/share/phantomjs
  sudo ln libs/phantomjs /usr/bin/phantomjs
  ```

* create an `auth.json` file

* create `/var/log/selenium.log` & `/var/log/testing.log` files

* start selenium on startup (in /etc/rc.local)

  `java -jar /PATH_TO/selenium/selenium-server-standalone-2.48.2.jar >> /var/log/selenium.log 2>&1`

* cron to run every 5 minutes between 7am & 10am

  `*/5 07,08,09 * * * /usr/bin/node /PATH_TO/burgeramt/check.js >> /var/log/testing.log 2>&1`
