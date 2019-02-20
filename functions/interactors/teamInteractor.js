
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

const tba = require('../api/tba-client').tbaClient;
const now = new Date();
const currentYear = now.getFullYear();

exports.getTeamWithActiveStatus = function(teamNumber) {
    return Promise.all([
        tba.getTeam(teamNumber),
        tba.getTeamEventsSimple(teamNumber)
    ]).then(([team, events]) => {
        // This assumes that the events list is ordered chronologically.
        const mostRecentEvent = events.slice(-1)[0];

        team.isActive = mostRecentEvent !== undefined && mostRecentEvent.year >= currentYear;
        team.mostRecentEventYear = mostRecentEvent.year
        team.isRookie = isTeamRookie(team);
        return team;
    });
}

function isTeamRookie(team) {
    // We no longer consider teams to be "rookies" once June hits.
    return (team.rookie_year === currentYear && now.getMonth() < 5)
        || team.rookie_year > currentYear;
}