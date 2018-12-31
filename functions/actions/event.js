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

const {prompt} = require('./common/actions')
const {basicPromptWithReentry} = require('./prompt-util')
const frcUtil = require('../frc-util');
const awards = require('../awards');
const events = require('../events');
const tba = require('../api/tba-client').tbaClient;

const getEventWinner = (conv, params) => {
  const eventCode = params["event"];
  const year = frcUtil.getYearOrThisYear(params);
  const eventKey = events.getEventKey(eventCode, year);

  const eventName = getEventName(eventKey);
  const eventWinners = getEventAwardWinnersData(eventKey, 1);

  return Promise.all([eventName, eventWinners])
        .catch((err) => {
          console.warn(err);
          return basicPromptWithReentry("I couldn't find information on that event.");
        })
        .then(([eventName, winners]) => {
          if (winners.length < 1) {
            return basicPromptWithReentry("I couldn't find a winner for that event.");
          }

          const teams = frcUtil.joinToOxfordList(winners);
          return basicPromptWithReentry(`Teams ${teams} won the ${year} ${eventName}`);
        });
}

const getEventAwardWinner = (conv, params) => {
  const awardType = parseInt(params["award"]);
  const eventCode = params["event"];
  const year = frcUtil.getYearOrThisYear(params);
  const eventKey = events.getEventKey(eventCode, year);
  const isCmp = events.isChampionship(eventCode);

  const eventName = getEventName(eventKey);
  const eventWinners = getEventAwardWinnersData(eventKey, awardType);

  return Promise.all([eventName, eventWinners])
        .catch((err) => {
          console.warn(err);
          return basicPromptWithReentry("I couldn't find information on that event.");
        })
        .then(([eventName, winners]) => {
          if (winners.length < 1) {
            return basicPromptWithReentry("I couldn't find that information.");
          }

          if (winners.length === 1) {
            conv.contexts.set("team", 5, { "team": winners[0].team_number });
          }
          conv.contexts.set("award", 5, { "award": 0 });

          const response = awards.getAwardWinnerText(winners, awardType, year, eventName, isCmp);
          return basicPromptWithReentry(response);
        });
}

const getEventAwardWinnersData = (eventKey, awardType) => {
  return tba.getEventAwards(eventKey)
      .then((data) => {
        const winnerAwards = data.filter((award) => {
          return award.award_type === awardType;
        })

        const winners = winnerAwards[0].recipient_list;

        return winners;
      })
      .then((winners) => {
        const winnerNamePromises = winners.map((winner) => {
          if (winner.awardee === null) { // No awardee, should have a team
            return getTeamDescriptor(winner.team_key);
          } else if (winner.team_key === null) { // Awardee, no team
            return Promise.resolve(winner.awardee);
          } else { // Awardee with team
            return getTeamDescriptor(winner.team_key)
                .then((teamName) => {
                  return `${winner.awardee} from team ${teamName}`;
                });
          }
        })

        return Promise.all(winnerNamePromises);
      });
}

const getTeamDescriptor = (teamKey) => {
  return tba.getTeamByKey(teamKey)
      .then((team) => {
        return `${team.team_number} (${team.nickname})`;
      });
}

const getEventName = (eventKey) => {
  return tba.getEvent(eventKey)
      .then((data) => {
        return data.name;
      });
}

const intents = {
  'event-award-winner': getEventAwardWinner,
  'event-winner': getEventWinner
}

module.exports.event = (conv, params) => {
  const responsePromise = intents[conv.intent](conv, params);
  return responsePromise.then((response) => {
    return prompt(conv, response);
  });
}