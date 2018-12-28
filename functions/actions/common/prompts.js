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

const {basicPrompt} = require('../prompt-util')

exports.defaultFallbackPrompts = [
    basicPrompt(`I'm not sure about that. Could you try again?`, `Could you try again?`),
    basicPrompt(`Hmmm, I don't know how to answer that. What can I help with?`),
    basicPrompt(`Looks like the code crashed. What do you want to know?`, `What do you want to know?`)
]
exports.fallbackFinal = basicPrompt(`Looks like this robot needs help from the programming team. Come back later!`)

exports.noInputPrompts = [
    basicPrompt(`I can give you information on FRC teams and events. What would you like to know?`),
    basicPrompt(`What can I tell you about FRC teams and events?`)
]
exports.noInputFinal = basicPrompt(`I'll have to respectfully decline your alliance invitation. Talk to you later!`)
