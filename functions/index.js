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

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(require('./app'))

exports.updateTeams = functions.pubsub
  .topic('update-teams')
  .onPublish((_) => {
    return getTbaUpdates().updateTeams();
  });

exports.updateEvents = functions.pubsub
  .topic('update-events')
  .onPublish((_) => {
    return getTbaUpdates().updateEvents();
  });

exports.updateAvatars = functions
  .runWith({
    timeoutSeconds: 360,
    memory: '512MB'
  })
  .pubsub
  .topic('update-avatars')
  .onPublish((_) => {
    const {updateAvatars} = require('./updates/update-avatars')
    return updateAvatars();
  });

function getTbaUpdates() {
  const tba = require('./api/tba-client').tbaClient;
  const {TbaDataUpdates} = require('./updates/tba-updates');
  return new TbaDataUpdates(tba);
}