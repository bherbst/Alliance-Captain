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

const {frcClient} = require('../api/frc-client')

const admin = require('firebase-admin')

var Promise = require("bluebird");

exports.updateAvatars = function() {
    const avatarBucket = admin.storage().bucket()
    const thisYear = new Date().getFullYear();

    // 2018 was the first year of avatars
    return getAvatarsRecursive(thisYear, 2018, [], avatarBucket);
}

function getAvatarsRecursive(startYear, endYear, savedTeams, avatarBucket) {
    console.log(`getAvatarsRecursive: ${startYear}, ${endYear}, ${JSON.stringify(savedTeams)}`)
    return getAvatarsForYear(startYear, savedTeams, avatarBucket)
        .then(teamsSaved => {
            console.log(`${teamsSaved.length} avatars saved`);
            savedTeams.concat(teamsSaved);
            if (startYear === endYear) {
                return Promise.resolve(savedTeams);
            } else {
                return getAvatarsRecursive(startYear - 1, endYear, savedTeams, avatarBucket);
            }
        });
}

function getAvatarsForYear(year, savedTeams, bucket) {
    return frcClient.getAvatars(year).then(data => {
        if (data.length < 0) {
            console.warn(`No avatars found for ${year}`)
            return Promise.resolve(undefined);
        }

        const firstPageAvatars = saveAllAvatars(data.teams, savedTeams, bucket);
        let pagePromises = [];

        if (data.pageTotal > data.pageCurrent) {
            let page;
            for (page = data.pageCurrent + 1; page <= data.pageTotal; page++) {
                pagePromises.push(getAvatarPage(year, page, savedTeams, bucket));
            }
        }

        return Promise.all(pagePromises).then(pageAvatarPromises => {
            return Promise.all([firstPageAvatars] + pageAvatarPromises)
        });
    });
}

function getAvatarPage(year, page, savedTeams, bucket) {
    return frcClient.getAvatars(year, page).then(data => {
        if (data.length < 0) {
            console.warn(`No avatars found for ${year} page ${page}`);
            return Promise.resolve(undefined);
        }

        const avatarPromises = saveAllAvatars(data.teams, savedTeams, bucket);
        
        return avatarPromises;
    });
}

function saveAllAvatars(teams, savedTeams, bucket) {
    let teamAvatarPromises = [];
    teams.forEach((team) => {
        if (savedTeams.includes(team) || team.encodedAvatar === null) {
            return;
        }

        teamAvatarPromises += saveAvatar(bucket, team.teamNumber, team.encodedAvatar)
            .then(metadata => {
                console.log("metadata: " + JSON.stringify(metadata))
                return Promise.resolve(team.teamNumber);
            })
            .catch(error => {
                console.warn(`Failed to save team ${team.teamNumber}'s ${year} avatar`);
                console.warn(error);
                return Promise.resolve(undefined);
            });
    });
    
    return Promise.all(teamAvatarPromises);
}

function saveAvatar(bucket, teamNumber, imageData) {
    return new Promise((resolve, reject) => {
        const fileUpload = bucket.file(`avatars/${teamNumber}.png`);
        const blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: "image/png"
            }
        });

        blobStream.on("error", error => {
            console.error(`Error saving avatar for team ${teamNumber}: ${error}`)
            reject(error)
        });

        blobStream.on("finish", () => {
            fileUpload.getMetadata()
            .then(metadata => resolve(metadata))
            .catch(error => reject(error));
        });

        blobStream.end(new Buffer(imageData, 'base64'));
  });
}