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
const {app} = require('./app')

const tba = require('./api/tba-client').tbaClient;
const {DataUpdates} = require('./data-updates');
const dataUpdates = new DataUpdates(tba);

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