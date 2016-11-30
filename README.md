# trailfindr-dreamforce2016-webapp 


This app was created for the TrailFindr project at Dreamforce 2016, where we enabled vision impaired people to navigate with the TrailFindr app autonomously througout the Trailhead zone. TrailFindr is based on the [Wayfindr Open Standard](https://www.wayfindr.net/open-standard).

The node.js based app served two purposes:

* Serving REST requests for Salesforce data using [Heroku Connect](https://www.heroku.com/connect)
* Enabling a simple registration of users for Apple iTunesConnect TestFlight (beta app usage)


## Live application

You can find the application on https://trailfindr.herokuapp.com. The TestFlight functionality is _not_ active.

These are the API urls for the Salesforce/Heroku Connect data if you want to checkout the used live data:

https://trailfindr.herokuapp.com/api/beacons

https://trailfindr.herokuapp.com/api/graph

https://trailfindr.herokuapp.com/api/venue



## Fun with Fastlane

One of the challenges was to allow the staffers of the TrailFindr booth in the IoT zone to register people for the beta access to the TrailFindr app. As there is no public/documented API for connecting to iTunesConnect I stumbled upon the [Fastlane project](https://github.com/fastlane/fastlane).

Fastlane is a great Ruby-based project that allows to manage lots of iTunesConnect tasks via a CLI. As that wasn't a viable option I modified the project a bit, so that one could pass the iTunesConnect password as parameter to the CLI (it's not enabled in the standard project).

This allows us to call the Ruby CLI via node.js to register new users in TestFlight. ;-)

## Local deployment

Clone this repo.

```
git clone https://github.com/muenzpraeger/trailfindr-dreamforce2016-webapp
```

Create in the root of the project a file _.env_ as described [here](https://devcenter.heroku.com/articles/heroku-local#set-up-your-local-environment-variables) for storing the Heroku environment variables.

Then add the following key/value pairs to the _.env_ file (only needed when testing the automatic beta tester registration for iTunesConnect TestFlight).

```
FASTLANE_APP_ID=the-app-id-of-the-testflight-app
FASTLANE_USERNAME=the-appleid-of-the-itunesconnect-admin
FASTLANE_PASSWORD=the-password-of-the-itunesconnect-admin
```

Now start the app via the Heroku Toolbelt.

```
heroku local web
```

## Development

If you want to develop with this code you can do it with any text editor of your choice. ;-)


## License

For licensing see the included [license file](https://github.com/muenzpraeger/trailfindr-dreamforce2016-webapp/blob/master/LICENSE.md).