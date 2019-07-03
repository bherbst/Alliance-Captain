# Alliance Captain Firebase Cloud Functions
Firebase Cloud Functions to support Alliance Captain.
Includes:
 * DialogFlow fulfillment
 * Data updates (e.g. update the team entities)

## Deploying

### Prerequisites

* Create a Firebase project

* Install the required tools
    * [`node` and `npm`](https://nodejs.org/en/)
    * [Firebase tools](https://firebase.google.com/docs/functions/get-started)

### 3. Deploy to Firebase

1. Configure the `firebase-tools` CLI to use the project your Firebase project.
```
$ firebase init
```
2. Install the Node dependencies
```
$ npm install
```
3. Deploy the functions
```
$ firebase deploy --only functions
```
4. Configure environment variables
    * The Blue Alliance API key: `firebase functions:config:set tba.key="KEY_HERE"`
    * FMS (FRC Events) API username: `firebase functions:config:set frc.username="USERNAME_HERE"`
    * FMS (FRC Events) API key: `firebase functions:config:set frc.key="KEY_HERE"`
    * DialogFlow entity ID for teams: `firebase functions:config:set entities.teams="ID_HERE"`
    * DialogFlow entity ID for events: `firebase functions:config:set entities.events="ID_HERE"`