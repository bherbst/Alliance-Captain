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

exports.isEventOver = (event) => {
  const eventEnd = new Date(event.end_date);
  eventEnd.setHours(23,59,59,999)
  return eventEnd < new Date();
}

exports.isEventActive = (event) => {
  const eventStart = new Date(event.start_date);
  const eventEnd = new Date(event.end_date);
  eventEnd.setHours(23,59,59,999)
  const now = new Date();
  return eventEnd < now && now > eventStart;
}