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
const util = require('../util');
const {AwardWinner, getAwardWinnerText} = require('../awards');
const {getTeamWithAvatar} = require('../interactors/teamInteractor')
const events = require('../events');
const tba = require('../api/tba-client').tbaClient;
const teamCard = require('../cards/team-card');
const eventCard = require('../cards/event-card');

const getEventWinner = (conv, params) => {
  const eventCode = params["event"];
  const year = frcUtil.getYearOrThisYear(params);
  const eventKey = events.getEventKey(eventCode, year);

  conv.contexts.set("season", 5, { "season": year });

  const eventData = tba.getEvent(eventKey);
  const eventWinners = getEventAwardWinnersData(eventKey, 1);

  return Promise.all([eventData, eventWinners])
        .catch((err) => {
          console.warn(err);
          return basicPromptWithReentry("I couldn't find information on that event.");
        })
        .then(([eventData, winners]) => {
          if (winners.length < 1) {
            if (!isEventOver(eventData)) {
              return basicPromptWithReentry(`The ${year} ${eventData.name} is not over yet.`);
            } else {
              return basicPromptWithReentry(`I couldn't find a winner for the ${year} ${eventData.name}.`);
            }
          }
        
          const teams = frcUtil.joinToOxfordList(winners, (winner) => winner.text);
          const screenContent = teamCard.createMultiTeamCard(winners.map((winner) => winner.team), year);
          const response = basicPromptWithReentry(`Teams ${teams} won the ${year} ${eventData.name}`);
          response.screenContent = screenContent;

          response.suggestions = getSuggestions(1); // 1 = event winner

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

  const eventData = tba.getEvent(eventKey);
  const eventWinners = getEventAwardWinnersData(eventKey, awardType);

  return Promise.all([eventData, eventWinners])
        .catch((err) => {
          console.warn(err);
          return basicPromptWithReentry("I couldn't find information on that event.");
        })
        .then(([eventData, winners]) => {
          if (winners.length < 1) {
            if (!isEventOver(eventData)) {
              return basicPromptWithReentry(`The ${year} ${eventData.name} is not over yet.`);
            } else {
              return basicPromptWithReentry(`I couldn't find a winner for that award at the ${year} ${eventData.name}.`);
            }
          }

          let screenContent;
          if (winners.length === 1) {
            if (winners[0].isTeam) {
              conv.contexts.set("team", 5, { "team": winners[0].team.team_number });
              screenContent = teamCard.createTeamCard(winners[0].team, year);
            }
          } else {
            if (winners[0].isTeam) {
              screenContent = teamCard.createMultiTeamCard(winners.map((winner) => winner.team), year);
            }
          }
          conv.contexts.set("award", 5, { "award": 0 });     

          const winnerText = getAwardWinnerText(winners, awardType, year, eventData.name, isCmp);
          const response = basicPromptWithReentry(winnerText);
          response.screenContent = screenContent;

          response.suggestions = getSuggestions(awardType);

          return response;
        });
}

const getEventAwardWinnersData = (eventKey, awardType) => {
  return tba.getEventAwards(eventKey)
      .then((data) => {
        const winnerAwards = data.filter((award) => {
          return award.award_type === awardType;
        })

        if (winnerAwards.length === 0) {
          return [];
        } else {
          return winnerAwards[0].recipient_list;
        }
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

        if (winnerNamePromises.lenght === 0) {
          return Promise.resolve([]);
        } else {
          return Promise.all(winnerNamePromises);
        }
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
        const endDate = new Date(event.end_date)

        let responseText = `The ${event.year} ${event.name}`;

        if (new Date() < endDate) {
          responseText += ` will be`;
        } else {
          responseText += ` was`;
        }

        responseText += ` at the ${event.location_name} in ${eventLocation}.`;

        const screenContent = eventCard.createEventCard(event);
        const response = basicPromptWithReentry(responseText);
        response.screenContent = screenContent;

        response.suggestions = getSuggestions();

        return response;
      });
}

const getEventDate = (conv, params) => {
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
        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date)

        let responseText = `The ${event.year} ${event.name}`;
        let responseSpeech = `<speak>The ${event.year} ${event.name}`;

        if (new Date() < endDate) {
          responseText += ` is ${util.monthDayString(startDate)}`;
          responseSpeech += ` is ${util.dateToSsml(startDate)}`;
        } else {
          responseText += ` was ${util.monthDayString(startDate)}`;
          responseSpeech += ` was ${util.dateToSsml(startDate)}`;
        }

        if (startDate.getTime() === endDate.getTime()) {
          responseText += `.`;
          responseSpeech += `.`;
        } else {
          responseText += ` to ${util.monthDayString(endDate)}.`;
          responseSpeech += ` to ${util.dateToSsml(endDate)}.`;
        }

        responseSpeech += `</speak>`

        const screenContent = eventCard.createEventCard(event);
        const response = basicPromptWithReentry(responseSpeech, responseText);
        response.screenContent = screenContent;

        response.suggestions = getSuggestions();

        return response;
      });
}

const getTeamAwardWinner = (teamKey, isTeamWinner) => {
  const teamNumber = teamKey.substring(3);
  return getTeamWithAvatar(teamNumber)
      .then((team) => {
        return new AwardWinner(isTeamWinner, `${team.team_number} (${team.nickname})`, team);
      });
}

const isEventOver = (event) => {
  const eventEnd = new Date(event.end_date);
  eventEnd.setHours(23,59,59,999)
  return eventEnd < new Date();
}

const getSuggestions = (excludeType) => {
  const suggestions = ["Winners", "Chairman's", "Finalists", "Engineering Inspiration", "Woodie Flowers"]
  switch(excludeType) {
    case 1: suggestions.splice(0, 1); break;
    case 0: suggestions.splice(1, 1); break;
    case 2: suggestions.splice(2, 1); break;
    case 9: suggestions.splice(3, 1); break;
    case 3: suggestions.splice(4, 1); break;
    default: break; // Default keep all suggestions
  }
  return suggestions;
}

const intents = {
  'event-award-winner': getEventAwardWinner,
  'event-winner': getEventWinner,
  'event-location': getEventLocation,
  'event-date': getEventDate,
  'event-winner-contextual': getEventAwardWinner,
  'event-chairmans-contextual': getEventAwardWinner,
  'event-finalist-contextual': getEventAwardWinner,
  'event-engineering-inspiration-contextual': getEventAwardWinner,
  'event-woodie-flowers-contextual': getEventAwardWinner
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