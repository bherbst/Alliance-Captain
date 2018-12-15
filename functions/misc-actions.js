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

const projectId = process.env.GCLOUD_PROJECT

module.exports.MiscActions = class MiscActions {

  startMatch (conv) {
    return this._playAudio(conv, "start_auto.wav", "match start sound");
  }

  startTeleop (conv) {
    return this._playAudio(conv, "start_teleop.wav", "teleop start sound");
  }

  endGame (conv) {
    return this._playAudio(conv, "end_game.wav", "end game sound");
  }

  matchEnd (conv) {
    return this._playAudio(conv, "match_end.wav", "match end sound");
  }

  matchPause (conv) {
    return this._playAudio(conv, "match_pause.wav", "match pause sound");
  }

  _playAudio(conv, filename, altText) {
    const url = `https://${projectId}.firebaseapp.com/audio/${filename}`;
    return conv.close(`<speak><audio src="${url}">${altText}</audio></speak>`);
  }

}