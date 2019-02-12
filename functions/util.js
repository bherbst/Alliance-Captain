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

const now = new Date();

exports.currentYear = now.getFullYear();

exports.dateToSsml = (date) => {
  const moment = require('moment');
  const dateString = moment(date).format("MM-DD");
  return `<say-as interpret-as="date" format="mmdd" detail="2">${dateString}</say-as>`
}

exports.monthDayString = (date) => {
  const moment = require('moment');
  return moment(date).format("MMMM Do")
}