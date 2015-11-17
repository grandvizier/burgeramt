# burgeramt
a script to check the burgeramt for available appt times and send an sms


## Prerequisites
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

  `sudo ln libs/phantomjs /usr/local/bin/phantomjs`
  *(check with `phantomjs -v`)*
  *might need to install `git-lfs-linux-amd64-1.0.2`*

* create an `auth.json` file

* create `/var/log/selenium.log` & `/var/log/testing.log` files

* start selenium on startup (in /etc/rc.local)

  `java -jar /home/ubuntu/selenium/selenium-server-standalone-2.48.2.jar >> /var/log/selenium.log 2>&1`

* cron to run every 5 minutes between 7am & 10am

  `*/5 07,08,09 * * * /usr/bin/node /home/jeff/Documents/devel/burgeramt/check.js >> /var/log/testing.log 2>&1`
