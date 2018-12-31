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
exports.prompt = (conv, prompts) => {
  console.log(`prompt: ${prompts}, ${conv}`)
  try {
    let variant = prompts;
    // Get the correct prompts for the curent surface (e.g. screen, speaker)
    if (prompts.screen && conv.screen) {
      variant = prompts.screen;
    } else if (prompts.speaker) {
      variant = prompts.speaker;
    } else if (prompts['screen/speaker']) {
      variant = prompts['screen/speaker'];
    }

    console.log(`variant: ${variant}`)
    conv.ask(getRandomElement(variant.responsePool));
    if (variant.followUpResponsePool) {
      conv.ask(getRandomElement(variant.followUpResponsePool));
    }
  } catch (error) {
    console.error(`Error parsing prompt: ${error}`);
    exports.fallback(conv);
    return;
  }
};