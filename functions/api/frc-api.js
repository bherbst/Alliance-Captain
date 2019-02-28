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
const Promise = require('bluebird');
const base_url = 'frc-api.firstinspires.org';

module.exports.FrcApi = class FrcApi {

    constructor (username, apiKey) {
        this.username = username;
        this.apiKey = apiKey;
    }

    _get(endpoint, onlyModifiedSince) {
        let data = ''
        const options = {
            hostname: base_url,
            path: endpoint,
            headers: {
                'Authorization': 'Basic ' + new Buffer(this.username + ':' + this.apiKey).toString('base64')
             } 
        };

        if (onlyModifiedSince) {
            // Temp disable due to https://usfirst.collab.net/sf/discussion/do/listPosts/projects.first_community_developers/discussion.frc_event_api.topc1987
            // options.headers['FMS-OnlyModifiedSince'] = onlyModifiedSince;
        }

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
                    if (!err) resolve({
                        headers: res.headers,
                        body: JSON.parse(data)
                    });
                });
            });
        });
    }

    getAvatars(year, page, onlyModifiedSince) {
        let pageParam = '';
        if (page) {
            pageParam = `?page=${page}`
        }
        return this._get(`/v2.0/${year}/avatars${pageParam}`, onlyModifiedSince)
    }

}
