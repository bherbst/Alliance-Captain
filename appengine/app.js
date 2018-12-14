/* Copyright 2018 Bryan Herbst
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const express = require('express');
const PubSub = require('@google-cloud/pubsub');

// Create a new PubSub client using the GOOGLE_CLOUD_PROJECT
// environment variable. This is automatically set to the correct
// value when running on AppEngine.
const pubsubClient = new PubSub({
  projectId: process.env.GOOGLE_CLOUD_PROJECT
});

const app = express();

// For any request to /public/{some_topic}, push a simple
// PubSub message to that topic.
app.get('/publish/:topic', async (req, res) => {
  const topic = req.params['topic'];

  try {
    await pubsubClient.topic(topic)
        .publisher()
        .publish(Buffer.from('run'));

    res.status(200).send('Published to ' + topic).end();
  } catch (e) {
    res.status(500).send('' + e).end();
  }
});

// Index page, just to make it easy to see if the app is working.
app.get('/', (req, res) => {
    res.status(200).send('[alliancecaptain_cron]: Hello, world!').end();
});

// Start the server
const PORT = process.env.PORT || 6060;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});