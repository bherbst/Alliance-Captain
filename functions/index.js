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
'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const {DataUpdates} = require('./data-updates');
const {team} = require('./actions/team');
const {event} = require('./actions/event');
const {misc} = require('./actions/misc');
const {
  fallback,
  noInput
} = require('./actions/common/prompts');

const tba = require('./api/tba-client').tbaClient;
const dataUpdates = new DataUpdates(tba);

const {dialogflow} = require('actions-on-google');
const app = dialogflow({
  debug: true,
  init: () => ({
    data: {
      fallbackCount: 0,
      noInputCount: 0
    }
  })
});

app.middleware((conv) => {
  if (!(conv.intent === 'fallback' || conv.intent === 'no-input')) {
    conv.data.fallbackCount = 0;
    conv.data.noInputCount = 0;
  }
})

app.intent([
  'event-award-winner',
  'event-winner'
], event)

app.intent([
  'team-rookie-year',
  'team-info',
  'team-location',
  'team-age',
  'team-nickname',
  'team-robot-name',
  'team-name',
  'team-events',
  'team-awards'
], team)

app.intent([
  'play-end-game',
  'play-match-end',
  'play-match-pause',
  'play-start-match',
  'play-start-teleop'
], misc)

app.intent('no-input', noInput);
app.intent('fallback', fallback);

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app)

exports.updateTeams = functions.pubsub
  .topic('update-teams')
  .onPublish((_) => {
    return dataUpdates.updateTeams();
  });

exports.updateEvents = functions.pubsub
  .topic('update-events')
  .onPublish((_) => {
    return dataUpdates.updateEvents();
  });