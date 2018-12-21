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

const {dialogflow} = require('actions-on-google');
const app = dialogflow({debug: true});

const DataUpdates = require('./data-updates').DataUpdates;
const TeamActions = require('./actions/team').TeamActions;
const {event} = require('./actions/event');
const MiscActions = require('./actions/misc').MiscActions;

const tba = require('./api/tba-client')
const dataUpdates = new DataUpdates(tba);
const teamActions = new TeamActions(tba);
const misc = new MiscActions();

app.intent([
  'event-award-winner',
  'event-winner'
], event)

app.intent('Team rookie year', (conv, params) => {
  return teamActions.getRookieYear(conv, params);
})

app.intent('Team info', (conv, params) => {
  return teamActions.getteamActions(conv, params);
})

app.intent('Team location', (conv, params) => {
  return teamActions.getTeamLocation(conv, params);
})

app.intent('Team age', (conv, params) => {
  return teamActions.getTeamAge(conv, params);
})

app.intent('Team nickname', (conv, params) => {
  return teamActions.getTeamNickName(conv, params);
})

app.intent('Team robot name', (conv, params) => {
  return teamActions.getRobotName(conv, params);
})

app.intent('Team name', (conv, params) => {
  return teamActions.getTeamName(conv, params);
})

app.intent('Team events', (conv, params) => {
  return teamActions.getTeamEvents(conv, params);
})

app.intent('Team awards', (conv, params) => {
  return teamActions.getTeamAwards(conv, params);
})

app.intent('Play end game', (conv, _) => {
  return miscActions.endGame(conv);
})

app.intent('Play match end', (conv, _) => {
  return miscActions.matchEnd(conv);
})

app.intent('Play match pause', (conv, _) => {
  return miscActions.matchPause(conv);
})

app.intent('Play start match', (conv, _) => {
  return miscActions.startMatch(conv);
})

app.intent('Play start teleop', (conv, _) => {
  return miscActions.startTeleop(conv);
})

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