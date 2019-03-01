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

const {team} = require('./actions/team');
const {event} = require('./actions/event');
const {misc} = require('./actions/misc');
const {
  fallback,
  noInput
} = require('./actions/common/actions');

const {dialogflow} = require('actions-on-google');
const app = dialogflow({
  debug: true
});

app.intent([
  'event-award-winner',
  'event-winner',
  'event-location',
  'event-date',
  'event-winner-contextual',
  'event-chairmans-contextual',
  'event-finalist-contextual',
  'event-engineering-inspiration-contextual',
  'event-woodie-flowers-contextual'
], event)

app.intent([
  'team-rookie-year',
  'team-info',
  'team-info-contextual',
  'team-location',
  'team-age',
  'team-nickname',
  'team-robot-name',
  'team-name',
  'team-events',
  'team-events-contextual',
  'team-awards',
  'team-awards-contextual',
  'team-championship',
  'team-championship-contextual'
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
app.fallback((conv) => {
  console.error(`No handler found for intent ${conv.intent}`)
  fallback(conv)
})

exports.app = app