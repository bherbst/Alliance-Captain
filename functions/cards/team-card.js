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

const projectId = process.env.GCLOUD_PROJECT

const frcUtil = require('../frc-util.js');
const {
    BasicCard,
    Button,
    BrowseCarousel,
    BrowseCarouselItem,
    Image
} = require('actions-on-google');

const {currentYear} = require('../util')

const {teamAvatars} = require('../firestore/avatars')

exports.createTeamCard = function(team, year = currentYear) {
    return new BasicCard({
        title: `Team ${team.team_number} - ${team.nickname}`,
        subtitle: frcUtil.getLocationString(team),
        text: `See event results and more on firstinspires.org`,
        buttons: new Button({
            title: `View Team Details`,
            url: `https://frc-events.firstinspires.org/${year}/team/${team.team_number}`
        }),
        image: new Image({
            url: `https://firebasestorage.googleapis.com/v0/b/${projectId}.appspot.com/o/avatars%2F${team.team_number}.png?alt=media`
        })
    });
}

exports.createMultiTeamCard = function(teams, year = currentYear) {
    return new BrowseCarousel({
        items: teams.map((team) => 
            new BrowseCarouselItem({
                title: `Team ${team.team_number} - ${team.nickname}`,
                url: `https://frc-events.firstinspires.org/${year}/team/${team.team_number}`,
                description: `From ` + frcUtil.getLocationString(team),
                image: new Image({
                    url: `https://firebasestorage.googleapis.com/v0/b/${projectId}.appspot.com/o/avatars%2F${team.team_number}.png?alt=media`
                })
            })
        )
    });
}