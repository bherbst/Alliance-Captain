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

const {SimpleResponse} = require('actions-on-google');
const {basicPrompt, Prompt} = require('../prompt-util')

exports.defaultFallbackPrompts = new Prompt([
    new SimpleResponse({
        speech: `I'm not sure about that. Could you try again?`,
        text: `Could you try again?`
    }),
    new SimpleResponse({speech: `Hmmm, I don't know how to answer that. What can I help with?`}),
    new SimpleResponse({
        speech: `Looks like the code crashed. What do you want to know?`,
        text: `What do you want to know?`
    })
])
exports.fallbackFinal = basicPrompt(`Looks like this robot needs help from the programming team. Come back later!`)

exports.noInputPrompts = new Prompt([
    new SimpleResponse({speech: `I can give you information on FRC teams and events. What would you like to know?`}),
    new SimpleResponse({speech: `What can I tell you about FRC teams and events?`})
])
exports.noInputFinal = basicPrompt(`I'll have to respectfully decline your alliance invitation. Talk to you later!`)