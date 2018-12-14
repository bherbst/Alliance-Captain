# App Engine component for Alliance Captain
Runs data updates for the Alliance Captain via cron jobs

## Deploying

### Prerequisites

* Create a Developers Console project.
    1. Install (or check that you have previously installed)
        * [`git`](https://git-scm.com/downloads)
        * [`node` and `npm`](https://nodejs.org/en/)
        * [Google Cloud SDK](http://cloud.google.com/sdk/)
    2. [Enable the Pub/Sub API](https://console.cloud.google.com/flows/enableapi?apiid=pubsub&redirect=https://console.cloud.google.com)
    3. [Enable Project Billing](https://support.google.com/cloud/answer/6293499#enable-billing)

### 3. Deploy to App Engine

1. Configure the `gcloud` command-line tool to use the project your Firebase project.
```
$ gcloud config set project <your-project-id>
```
2. Install the Node dependencies
```
$ npm install
```
4. Create an App Engine App
```
$ gcloud app create
```
5. Deploy the application to App Engine.
```
# You can also run 'npm run deploy'
$ gcloud app deploy app.yaml cron.yaml
```
6. Open `https://YOUR_PROJECT_ID.appspot.com` to make sure your AppEngine app
was correctly deployed. You should see a "Hello, world!" message.
7. Create the pub/sub topics
```
gcloud pubsub topics create update-teams
gcloud pubsub topics create update-events
```

## Manual execution
You can run the functions manually via the CLI by sending a message (any message) to the appropriate pub/sub topics.

Update teams: `gcloud pubsub topics publish update-teams --message "cli run"`

Update events: `gcloud pubsub topics publish update-events --message "cli run"`