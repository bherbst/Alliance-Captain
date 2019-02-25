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
`use strict`

const {projectId} = require('../globals')

const startMatch = (conv) => {
  return playAudio(conv, "start_auto.wav", "match start sound");
}

const startTeleop = (conv) => {
  return playAudio(conv, "start_teleop.wav", "teleop start sound");
}

const endGame = (conv) => {
  return playAudio(conv, "end_game.wav", "end game sound");
}

const matchEnd = (conv) => {
  return playAudio(conv, "match_end.wav", "match end sound");
}

const matchPause = (conv) => {
  return playAudio(conv, "match_pause.wav", "match pause sound");
}

const playAudio = (conv, filename, altText) => {
  const url = `https://${projectId}.firebaseapp.com/audio/${filename}`;
  return conv.close(`<speak><audio src="${url}">${altText}</audio></speak>`);
}

const intents = {
  'play-end-game': endGame,
  'play-match-end': matchEnd,
  'play-match-pause': matchPause,
  'play-start-match': startMatch,
  'play-start-teleop': startTeleop
}

module.exports.team = (conv, params) => {
  return intents[conv.intent](conv, params)
}