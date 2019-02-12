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

const frcUtil = require('./frc-util.js');

// Maps standard (non-specialized) awards to their names
const awardsByType = {
    0: "Chairman's",
    5: "Volunteer of the Year",
    6: "Founder's ",
    8: "Make it Loud",
    9: "Engineering Inspiration",
    10: "Rookie All Star",
    11: "Gracious Professionalism",
    12: "Coopertition",
    13: "Judge's",
    14: "Highest Rookie Seed",
    15: "Rookie Inspiration",
    16: "Industrial Design",
    17: "Quality",
    18: "Safety",
    19: "Sportsmanship",
    20: "Creativity",
    21: "Engineering Excellence",
    22: "Entrepreneurship",
    27: "Imagery",
    28: "Media and Technology Innovation",
    29: "Innovation in Control",
    30: "Spirit",
    31: "Website",
};

exports.AwardWinner = class AwardWinner {
    constructor(isTeam, text, team) {
      this.isTeam = isTeam;
      this.text = text;
      this.team = team;
    }
  };

exports.getAwardWinnerText = function(winners, awardType, year, eventName, isChampionship) {
    const awardees = frcUtil.joinToOxfordList(winners, (winner) => winner.text);

    switch(awardType) {
        case 1: { // Event winner
            return `${awardees} won the ${year} ${eventName}`;
        }
        case 2: { // Event finalist
            return `${awardees} were finalists at the ${year} ${eventName}`;
        }
        case 3: { // Woodie Flowers
            let awardName;
            if (isChampionship) {
                awardName = "Woodie Flowers Award";
            } else {
                awardName = "Woodie Flowers Finalist Award";
            }
            return standardAwardString(awardName, awardees, year, eventName);
        }
        case 7: { // Bart Kamen Memorial Scholarship
            return standardAwardString("Bart Kamen Memorial Scholarship", awardees, year, eventName);
        }
        case 4: { // Dean's List
            let awardName;
            if (isChampionship) {
                awardName = "Dean's List Award";
            } else {
                awardName = "Dean's List Finalist Award";
            }
            return standardAwardString(awardName, awardees, year, eventName);
        }
        case 68: { // Wildcard
            return `${awardees} earn a wildcard at the ${year} ${eventName}`;
        }
        case 69: { // Chairman's finalist
            if (awardees.length > 1) {
                return `${awardees} were Chairman's Award finalists at the ${year} ${eventName}`;
            } else {
                return `${awardees} was a Chairman's Award finalist at the ${year} ${eventName}`;
            }
        }
        default: {
            const awardName = awardsByType[awardType] + " Award";
            return standardAwardString(awardName, awardees, year, eventName);
        }
    }
}

function standardAwardString(awardName, awardees, year, eventName) {
    return `${awardees} won the ${awardName} at the ${year} ${eventName}`;
}