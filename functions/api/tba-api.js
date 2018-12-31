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

const https = require('https');
const base_url = 'www.thebluealliance.com';

module.exports.TbaApi = class TbaApi {

    constructor (apiKey) {
        this.apiKey = apiKey;
    }

    _get(endpoint) {
        let data = ''
        const options = {
            hostname: base_url,
            path: endpoint,
            headers: {
                'X-TBA-Auth-Key': this.apiKey
            }
        };

        return new Promise((resolve, reject) => {
            const optsString = JSON.stringify(options);
            console.log(`Sending HTTP get ${optsString}`);
            https.get(options, (res) => {
                let err;
                if (res.statusCode !== 200) {
                    err = `${res.statusCode} (${res.statusMessage}): ${optsString}`;
                    reject(err);
                }

                res.on('data', (d) => {
                    data += d;
                });

                res.on('end', (d) => {
                    if (!err) resolve(JSON.parse(data));
                });
            });
        });
    }

    getTeamList(page) {
        return this._get(`/api/v3/teams/${page}`);
    }
    
    // TODO unify these two
    getTeamByKey(teamKey) {
        return this._get(`/api/v3/team/${teamKey}`);
    }
    getTeam(teamNumber) {
        return this._get(`/api/v3/team/frc${teamNumber}`);
    }
    
    getTeamEvents(team, year) {
        if (year) {
            return this._get(`/api/v3/team/frc${team}/events/${year}/simple`);
        } else {
            return this._get(`/api/v3/team/frc${team}/events/simple`);
        }
    }
    
    getTeamAwards(team, year) {
        if (year) {
            return this._get(`/api/v3/team/frc${team}/awards/${year}`);
        } else {
            return this._get(`/api/v3/team/frc${team}/awards`);
        }
    }
    
    getTeamEventAwards(team, eventCode) {
        return this._get(`/api/v3/team/frc${team}/event/${eventCode}/awards`);
    }
    
    getEventList(year) {
        return this._get(`/api/v3/events/${year}`);
    }
    
    getEvent(eventCode) {
        return this._get(`/api/v3/event/${eventCode}`);
    }

    getEventAwards(eventCode) {
        return this._get(`/api/v3/event/${eventCode}/awards`);
    }
}
