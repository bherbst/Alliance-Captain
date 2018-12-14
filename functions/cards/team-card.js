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

const frcUtil = require('../frc-util.js');
const {
    dialogflow,
    BasicCard,
    Permission,
    Suggestions,
    Carousel,
    Image,
  } = require('actions-on-google');

exports.createTeamCard = function(team) {
    return new BasicCard({
        title: `Team ${team.team_number} - ${team.nickname}`,
        subtitle: frcUtil.getLocationString(data),
        text: `Current year summary goes here. They are registered for ____. They competed at ____.`,
        buttons: new Button({
            title: `View Team Details`,
            url: `https://frc-events.firstinspires.org/2018/team/${team.team_number}`
        })
    })
}