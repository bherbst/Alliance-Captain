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

exports.basicPrompt = (speech, text) => {
    return new exports.Prompt({responsePool: [
            new SimpleResponse({
                speech: speech,
                text: text ? text : speech
            })
        ]})
};

exports.reentryPool = [
    new SimpleResponse({speech: `What else would you like to know?`}),
    new SimpleResponse({speech: `What else can I help you with?`}),
    new SimpleResponse({speech: `What other questions can I answer?`})
];

exports.basicPromptWithReentry = (speech, text) => {
    return new exports.Prompt({
        responsePool: [
            new SimpleResponse({
                speech: speech,
                text: text ? text : speech
            })
        ],
        followUpResponsePool: exports.reentryPool
    })
};

exports.Prompt = class Prompt {
    /**
     * Prompt constructor
     * 
     * @param {Object} options A configuration object for this Prompt
     * @param {Array} options.responsePool An array of possible responses. A single random response will be presented to the user
     * @param {Array} options.followUpResponsePool An array of follow up responses. A single random response will be presented to the user
     * @param {Object} options.screenContent Screen content (such as a BasicCard) to display to the user if on a surface with a display
     * @param {Array} options.suggestions An array of suggestion chips to display to the user if on a surface with a display.
     */
    constructor(options = {}) {
        this.responsePool = options.responsePool
        this.followUpResponsePool = options.followUpResponsePool
        this.screenContent = options.screenContent
        this.suggestions = options.suggestions;
    }
};