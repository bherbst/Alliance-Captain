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

const Promise = require('bluebird')
const admin = require('firebase-admin')

const {frcClient} = require('../api/frc-client')

const avatarsCollection = admin.firestore().collection("avatars");
const syncInfo = avatarsCollection.doc("sync-info");
const teamAvatars = avatarsCollection.doc("teamAvatars");

exports.updateAvatars = function() {
    const avatarBucket = admin.storage().bucket()
    const thisYear = new Date().getFullYear();

    let metadataDoc;
    let avatarsDoc;
    return syncInfo.get().then(metadataDocRef => {
        metadataDoc = metadataDocRef;

        if (metadataDoc.exists) {
            return Promise.resolve(metadataDoc);
        } else {
            return syncInfo.create({});
        }
    }).then(_ => {
        return teamAvatars.get();
    }).then(avatarsDocRef => {
        avatarsDoc = avatarsDocRef;
        if (avatarsDoc.exists) {
            return Promise.resolve(avatarsDoc);
        } else {
            return teamAvatars.create({});
        }
    }).then(_ => {
        // 2018 was the first year of avatars, no need to try for years before that
        const updater = new AvatarUpdater(thisYear, 2018, avatarBucket, metadataDoc.data(), avatarsDoc.data());
        return updater.syncAvatars();
    });
}

const AvatarUpdater = class {
    constructor(startYear, endYear, avatarBucket, syncMetadata, avatars) {
        this.startYear = startYear;
        this.endYear = endYear;
        this.avatarBucket = avatarBucket;

        if (syncMetadata) {
            this.syncMetadata = syncMetadata;
        } else {
            this.syncMetadata = {};
        }

        if (avatars) {
            this.avatars = avatars;
        } else {
            this.avatars = {};
        }
    }

    /**
     * Sync all team avatars
     */
    syncAvatars() {
        let syncPromise = this._syncAvatarsForYear(this.startYear).catch(error => {
            console.log(`Failed to sync avatars for ${this.startYear}.`);
            console.error(error);
        });

        for (let year = this.startYear - 1; year >= this.endYear; year--) {
            syncPromise = syncPromise.then(_ => {
                return this._syncAvatarsForYear(year);
            }).catch(error => {
                console.log(`Failed to sync avatars for ${year}.`);
                console.error(error);
            });
        }

        return syncPromise;
    }

    /**
     * Persist data about teams' avatars to firestore for later reference
     */
    _saveAvatarDataToFirestore(avatarData) {
        if (avatarData.length === 0) {
            return Promise.resolve(null);
        }

        const pendingAvatarMap = this._getAvatarMap(avatarData);
        this.avatars = Object.assign(this.avatars, pendingAvatarMap);

        return teamAvatars.update(pendingAvatarMap);
    }

    _getAvatarMap(avatarData) {
        let avatarMap = {};
        avatarData.forEach(avatar => {
            if (avatar !== null) {
                avatarMap[avatar.teamNumber] = {
                    year: avatar.year,
                    path: avatar.path
                }
            }
        });
        return avatarMap;
    }
    
    /**
     * Sync all avatars for a given year.
     * This will get all team avatar data for that year, save any new avatars to Google Cloud,
     * and persist the metadata for that team's avatar (team number, path, and year) to Firestore.
     * 
     * @param year
     */
    _syncAvatarsForYear(year) {
        // We need the first page to know how many pages there are, then we'll make more calls
        let avatarData;
        let pageZeroLastModified;
        return this._getAvatarsWithLastModified(year, 0).then(result => {
            const data = result.body;
            if (data.length < 0) {
                console.warn(`No avatars found for ${year}`)
                return Promise.resolve(undefined);
            }
    
            pageZeroLastModified = result.headers['last-modified'];
            let pagePromises = [Promise.resolve(this._saveTeamAvatars(year, data.teams))];
    
            // Build up a list of all subsequent pages so we can fetch them simulataneously
            if (data.pageTotal > data.pageCurrent) {
                let page;
                for (page = data.pageCurrent + 1; page <= data.pageTotal; page++) {
                    pagePromises.push(this._syncAvatarPage(year, page));
                }
            }

            return Promise.all(pagePromises)
        }).then((pageAvatarPromises) => {
            return Promise.all(pageAvatarPromises);
        }).then(tmpAvatarData => {
            avatarData = tmpAvatarData;

            // Update our last modified date for future header use
            this.syncMetadata[year] = pageZeroLastModified;
            return syncInfo.update(this.syncMetadata);
        }).then(_ => 
            avatarData
        ).catch(error => {
            console.log(`Failed to get avatars for ${year}, page 0.`);
            console.error(error);
        });
    }
    
    /**
     * Sync a specific page of avatar data for a year
     * 
     * @param year 
     * @param page 
     */
    _syncAvatarPage(year, page) {
        return this._getAvatarsWithLastModified(year, page).then(result => {
            const data = result.body;
            if (data.length < 0) {
                console.warn(`No avatars found for ${year} page ${page}`);
                return Promise.resolve([]);
            }

            return this._saveTeamAvatars(year, data.teams);
        }).then(avatarData => {
            return this._saveAvatarDataToFirestore(avatarData)
        }).catch(error => {
            console.log(`Failed to get avatars for ${year}, page ${page}. ${error}`);
        });
    }
    
    /**
     * Save teams' encoded avatars to disk (in Google Cloud)
     * 
     * @param year 
     * @param teams A list of team avatar data to save
     */
    _saveTeamAvatars(year, teams) {
        let teamAvatarPromises = [];
        teams.forEach((team) => {
            if (team.encodedAvatar === null) {
                return;
            }

            // Skip the team if we already have a newer avatar
            const alreadyHasAvatar = team.teamNumber in this.avatars;
            if (alreadyHasAvatar) {
                const existingAvatar = this.avatars[team.teamNumber];
                if (existingAvatar.year > year) {
                    return;
                }
            }
    
            console.log(`Saving team ${team.teamNumber}'s ${year} avatar.`)

            const avatarPromise = this._saveAvatarImage(team.teamNumber, team.encodedAvatar)
                .then(metadata => {
                    const result = {
                        teamNumber: team.teamNumber,
                        year: year,
                        path: metadata[0].name
                    };
                    return result
                })
                .catch(error => {
                    console.warn(`Failed to save team ${team.teamNumber}'s ${year} avatar`);
                    console.warn(error);
                    return null;
                });

            teamAvatarPromises.push(avatarPromise);
        });

        if (teamAvatarPromises.length > 0) {
            return Promise.all(teamAvatarPromises);
        } else {
            return Promise.resolve([])
        }
    }
    
    /**
     * Create a PNG image file version of a single team's avatar on Google Cloud
     * @param teamNumber 
     * @param imageData base64 encoded PNG image of the team's avatar
     */
    _saveAvatarImage(teamNumber, imageData) {
        return new Promise((resolve, reject) => {
            const fileUpload = this.avatarBucket.file(`avatars/${teamNumber}.png`);
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
}