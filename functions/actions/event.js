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

const {prompt, fallback} = require('./common/actions');
const {basicPromptWithReentry} = require('./prompt-util');
const frcUtil = require('../frc-util');
const {AwardWinner, getAwardWinnerText} = require('../awards');
const events = require('../events');
const tba = require('../api/tba-client').tbaClient;
const teamCard = require('../cards/team-card');
const eventCard = require('../cards/event-card');

const getEventWinner = (conv, params) => {
  const eventCode = params["event"];
  const year = frcUtil.getYearOrThisYear(params);
  const eventKey = events.getEventKey(eventCode, year);

  conv.contexts.set("season", 5, { "season": year });

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
        
          const teams = frcUtil.joinToOxfordList(winners, (winner) => winner.text);
          const screenContent = teamCard.createMultiTeamCard(winners.map((winner) => winner.team));
          const response = basicPromptWithReentry(`Teams ${teams} won the ${year} ${eventName}`);
          response.screenContent = screenContent;

          return response;
        });
}

const getEventAwardWinner = (conv, params) => {
  const awardType = parseInt(params["award"]);
  const eventCode = params["event"];
  const year = frcUtil.getYearOrThisYear(params);
  const eventKey = events.getEventKey(eventCode, year);
  const isCmp = events.isChampionship(eventCode);

  conv.contexts.set("season", 5, { "season": year });   

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

          let screenContent;
          if (winners.length === 1) {
            if (winners[0].isTeam) {
              conv.contexts.set("team", 5, { "team": winners[0].team.team_number });
              screenContent = teamCard.createTeamCard(winners[0].team);
            }
          } else {
            if (winners[0].isTeam) {
              screenContent = teamCard.createMultiTeamCard(winners.map((winner) => winner.team));
            }
          }
          conv.contexts.set("award", 5, { "award": 0 });     

          const winnerText = getAwardWinnerText(winners, awardType, year, eventName, isCmp);
          const response = basicPromptWithReentry(winnerText);
          response.screenContent = screenContent;

          return response;
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
            return getTeamAwardWinner(winner.team_key, true)
          } else if (winner.team_key === null) { // Awardee, no team
            return Promise.resolve(new AwardWinner(false, winner.awardee));
          } else { // Awardee with team
            return getTeamAwardWinner(winner.team_key, false)
                .then((awardWinner) => {
                  const teamName = awardWinner.text
                  awardWinner.text = `${winner.awardee} from team ${teamName}`
                  return awardWinner;
                });
          }
        })

        return Promise.all(winnerNamePromises);
      });
}

const getEventLocation = (conv, params) => {
  const eventCode = params["event"];
  const year = frcUtil.getYearOrThisYear(params);
  const eventKey = events.getEventKey(eventCode, year);

  conv.contexts.set("season", 5, { "season": year });

  return tba.getEvent(eventKey)
      .catch((err) => {
        console.warn(err);
        return basicPromptWithReentry("I couldn't find information on that event.");
      })
      .then((event) => {
        const eventLocation = frcUtil.getEventLocation(event);
        let responseText = `The ${event.year} ${event.name} was at the ${event.location_name} in ${eventLocation}.`;

        const screenContent = eventCard.createEventCard(event);
        const response = basicPromptWithReentry(responseText);
        response.screenContent = screenContent;

        return response;
      });
}

const getTeamAwardWinner = (teamKey, isTeamWinner) => {
  return tba.getTeamByKey(teamKey)
      .then((team) => {
        return new AwardWinner(isTeamWinner, `${team.team_number} (${team.nickname})`, team);
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
  'event-winner': getEventWinner,
  'event-location': getEventLocation
}

module.exports.event = (conv, params) => {
  const responsePromise = intents[conv.intent](conv, params);
  return responsePromise.then((response) => {
    return prompt(conv, response);
  })
  .catch((err) => {
    console.warn(err);
    return fallback(conv);
  });
}