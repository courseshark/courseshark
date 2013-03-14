CourseShark
=============

Schedule Creator and Job finder for college students.


Setup
-------

Configuration is now done via environment variables. In order to remain consistant between
install types the courseshark executable loads in a file 
[~/.env_vars](https://github.com/courseshark/courseshark/blob/master/courseshark#L8). This file is managed via
the salt-master [cerebro](https://github.com/courseshark/courseshark/wiki/Cerebro-Server). 

The variables looked for in the scripts are:

* `NODE_ENV` - Standard environment to run in `development|production|testing`
* `PORT` - What port to run the HTTP service on ( should be 8080 )
* `COURSESHARK_MODE` - specifies the mode to run in
  * `main` - runs the main website. This is the default value if not set
  * `seat-watcher` - runs the seat-watcher job
  * `admin` - runs the admin site
* `COURSESHARK_DOMAIN` - Domain (without slashes) the current instance is bound to
* `COURSESHARK_ACCESS_LOG` - Location of access log
*
* `COURSESHARK_MONGODB_URI` - URI (with user/pass) of the mongoDB instance to connect to for data storage
* `COURSESHARK_REDIS_URI` - URI (host/port) of the REDIS instance to connection to for socket.io
*
* `COURSESHARK_FB_APP_ID` - FB API app id
* `COURSESHARK_FB_APP_SECRET` - FB API app secret
* `COURSESHARK_FB_HOST` - URI of the host authenticating
*
* `COURSESHARK_GOOGLE_APIKEY` - Google apiKey
* `COURSESHARK_GOOGLE_CLIENT_ID` - Google Client ID
* `COURSESHARK_GOOGLE_CLIENT_SECRET` - Google Client Secret
* `COURSESHARK_GOOGLE_ISS` - Google ISS ( used for in-app payments )
* `COURSESHARK_GOOGLE_SELLER_SECRET` - Google Seller Secret ( used or in-app payments )
*
* `COURSESHARK_TWITTER_CONSUMER_KEY` - Twitter API consumer key
* `COURSESHARK_TWITTER_CONSUMER_SECRET` - Twitter API secret
*
* `COURSESHARK_LINKEDIN_CONSUMER_KEY` - LinkedIn Consumer Key
* `COURSESHARK_LINKEDIN_CONSUMER_SECRET` - LinkedIn Consumer Secret
* `COURSESHARK_LINKEDIN_OAUTH_TOKEN` - LinkedIn OAuth token
* `COURSESHARK_LINKEDIN_OAUTH_SECRET` - LinkedIn OAuth secret
*
* `COURSESHARK_TWILIO_SID` - Twilio Service ID
* `COURSESHARK_TWILIO_AUTH_TOKEN` - Twilio authorization token
* `COURSESHARK_TWILIO_NUMBER` - Twilio phone number SMS will be sent from
*
* `COURSESHARK_MANDRILL_KEY` - Mandrill API key
* `COURSESHARK_NOTIFICATION_EMAIL` - Email notifications will be sent from
* `COURSESHARK_NOTIFICATION_PASSWORD` - Password for email that notifications will be sent from
*
* `COURSESHARK_MIXPANEL_ACCESS_TOKEN` - Mixpanel API Token
* `COURSESHARK_MIXPANEL_DEBUG` - Mixpanel Debug property
* `COURSESHARK_MIXPANEL_TEST` - Mixpanel Config Test property
*
* `COURSESHARK_SEARCH_CACHE_EXPIRE` - How long to cache search results in the Redis store

For default development and production values for the above variables contact [james](mailto://james@courseshark.com)


Contributing
-------
* *NEVER* work in the main branch
* Always work in your own branch, or branches.
* Push your completed branch to the repo only if it needs to be reviewed by others
* When you are ready to commit your code into the main branch, submit a pull request that is well documented on the changes you made
* Your pull will be reviewed by the team, and mereged if/when it is good.
* Master branch is always working code
  * Master could be launched live at any time
