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

const MAX_RETRY = 2

/**
 * Get a random element from an array
 */
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)]

/**
 * Respond with a fallback response
 */
exports.fallback = (conv) => {
    const prompts = require(`./prompts`);
    const countSum = conv.data.fallbackCount + conv.data.noInputCount;

    if (countSum < MAX_RETRY) {
      const prompt = prompts.defaultFallbackPrompts[countSum];
      conv.ask(...prompt.responses);

      if (prompt.suggestions) {
        conv.ask(getSuggestions(prompt.suggestions));
      }
    } else {
      const prompt = prompts.fallbackFinal
      conv.close(...prompt.responses);
    }
    conv.data.fallbackCount++;
  };
  
  /**
   * Respond with a no-input response
   */
  exports.noInput = (conv) => {
    const prompts = require(`./prompts`);
    const countSum = conv.data.fallbackCount + conv.data.noInputCount;
    
    if (countSum < MAX_RETRY) {
      const prompt = prompts.noInputPrompts[countSum];
      conv.ask(...prompt.responses);

      if (prompt.suggestions) {
        conv.ask(getSuggestions(prompt.suggestions));
      }
    } else {
      const prompt = prompts.noInputFinal
      conv.close(...prompt.responses);
    }
    conv.data.noInputCount++;
  };