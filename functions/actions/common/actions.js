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

const {Suggestions} = require('actions-on-google');

/**
 * Get a random element from an array
 */
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)]

/**
 * Respond with a fallback response
 */
exports.fallback = (conv) => {
    const prompts = require(`./prompts`);
    exports.prompt(conv, prompts.defaultFallbackPrompts)
  };
  
  /**
   * Respond with a no-input response
   */
  exports.noInput = (conv) => {
    const prompts = require(`./prompts`);
    exports.prompt(conv, prompts.noInputPrompts)
  };

  /**
   * Send a prompt to the user.
   * 
   * Randomly picks a prompt from the list of suitable responses based on the interaction
   * surface.
   */
exports.prompt = (conv, prompt) => {
  try {
    const initialResponse = getRandomElement(prompt.responsePool);

    if (prompt.screenContent && conv.screen) {
      conv.ask(initialResponse, prompt.screenContent);
    } else {
      conv.ask(initialResponse)
    }

    if (prompt.followUpResponsePool) {
      conv.ask(getRandomElement(prompt.followUpResponsePool));
    }

    if (prompt.suggestions) {
      conv.ask(new Suggestions(prompt.suggestions));
    }

  } catch (error) {
    console.error(`Error parsing prompt: ${error}`);
    exports.fallback(conv);
    return;
  }
};