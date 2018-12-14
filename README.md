# Alliance Captain DialogFlow bot
Alliance Captain is a DialogFlow bot that provides users with information on [*FIRST* Robotics Competition](https://firstinspires.org) teams and events.

## Components
This project contains three primary components:

* [DialogFlow Agent (`agent`)](agent/README.md) - An export of the DialogFlow agent
* [Firebase Cloud Functions (`functions`)](functions/README.md) - DialogFlow fulfillment backend
* [AppEngine app (`appengine`)](appengine/README.md) - Runs automated data updates

## Getting started.
1. Start by creating a Firebase project in the [Firebase console](https://console.firebase.com).
2. Then create and configure your DialogFlow agent. Be sure to link your DialogFlow agent to your new Firebase/Google Cloud project.
3. Deploy the appengine agent (see the [`appengine` README](appengine/README.md))
4. Deploy the Firebase Cloud Functions (see the [`functions` README](functions/README.md))
5. Deploy the Firebase Hosting static content
  ```
  firebase deploy --only hosting
  ```
6. Configure DialogFlow fulfillment
    * In the Firebase Cloud Functions console, copy the HTTP request URL for your `dialogflowFirebaseFulillment` function
    * In the DialogFlow agent, go to **Fulfillment**, enable **Webhook**, and paste in your URL.