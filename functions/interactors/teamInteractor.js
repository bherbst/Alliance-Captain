
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

const {teamAvatars} = require('../firestore/avatars')

const {projectId} = require('../globals')

exports.getTeamWithActiveStatus = function(teamNumber, getAvatar = true) {
    let avatarPromise;
    if (getAvatar) {
        avatarPromise = teamAvatars.doc(teamNumber.toString()).get();
    } else {
        avatarPromise = Promise.resolve(null);
    }

    return Promise.all([
        tba.getTeam(teamNumber),
        tba.getTeamEventsSimple(teamNumber),
        avatarPromise
    ]).then(([team, events, avatar]) => {
        // This assumes that the events list is ordered chronologically.
        const mostRecentEvent = events.slice(-1)[0];

        team.isActive = mostRecentEvent !== undefined && mostRecentEvent.year >= currentYear;
        if (mostRecentEvent) {
            team.mostRecentEventYear = mostRecentEvent.year
        }
        team.isRookie = isTeamRookie(team);

        if (avatar && avatar.exists) {
            team.avatarUrl = getAvatarUrl(avatar);
        }

        return team;
    });
}

exports.getTeamWithAvatar = function(teamNumber) {
    return Promise.all([
        tba.getTeam(teamNumber),
        teamAvatars.doc(teamNumber.toString()).get()
    ]).then(([team, avatar]) => {
        if (avatar.exists) {
            team.avatarUrl = getAvatarUrl(avatar);
        }

        return team;
    });
}

function getAvatarUrl(avatarDoc) {
    const avatarPath = encodeURIComponent(avatarDoc.data().path);
    return `https://firebasestorage.googleapis.com/v0/b/${projectId}.appspot.com/o/${avatarPath}?alt=media`;
}

function isTeamRookie(team) {
    // We no longer consider teams to be "rookies" once June hits.
    return (team.rookie_year === currentYear && now.getMonth() < 5)
        || team.rookie_year > currentYear;
}