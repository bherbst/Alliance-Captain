
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

const groupBy = require('lodash.groupby');

const frcUtil = require('../frc-util');
const {prompt, fallback} = require('./common/actions')
const {basicPromptWithReentry} = require('./prompt-util')
const {createTeamCard} = require('../cards/team-card')
const {getTeamWithActiveStatus} = require('../interactors/teamInteractor')
const eventCards = require('../cards/event-card')
const tba = require('../api/tba-client').tbaClient;

const getRookieYear = (conv, params) => {
  const team_number = params["team"];

  return tba.getTeam(team_number)
      .catch((err) => {
        console.warn(err);
        return basicPromptWithReentry(`I couldn't find ${team_number}'s rookie year.`);
      })
      .then((data) => {
        const name = frcUtil.nicknameOrNumber(data);
        conv.contexts.set("season", 5, { "season": data.rookie_year });
        if (data.rookie_year >= new Date().getFullYear()) {
          return basicPromptWithReentry(`${data.rookie_year} is ${name}'s rookie year.`);
        } else {
          return basicPromptWithReentry(`${name}'s rookie year was ${data.rookie_year}.`);
        }
      });
}

const getTeamName = (conv, params) => {
  const team_number = params["team"];

  return tba.getTeam(team_number)
      .catch((err) => {
        console.warn(err);
        return basicPromptWithReentry(`I couldn't find ${team_number}'s name.`);
      })
      .then((data) => {
        return basicPromptWithReentry(`FRC team ${team_number}'s name is ${data.name}.`);
      });
}

const getTeamNickName = (conv, params) => {
  const team_number = params["team"];

  return tba.getTeam(team_number)
      .catch((err) => {
        console.warn(err);
        return basicPromptWithReentry(`I couldn't find ${team_number}'s nickname.`);
      })
      .then((data) => {
        return basicPromptWithReentry(`FRC team ${team_number}'s nickname is ${data.nickname}.`);
      });
}

const getTeamLocation = (conv, params) => {
  const team_number = params["team"];

  return getTeamWithActiveStatus(team_number, false)
      .catch((err) => {
        console.warn(err);
        return basicPromptWithReentry(`I couldn't find ${team_number}'s location.`);
      })
      .then((team) => {
        const name = frcUtil.nicknameOrNumber(team);
        const location = frcUtil.getLocationString(team);
        
        if (team.isActive) {
          return basicPromptWithReentry(`${name} is from ${location}.`);
        } else {
          return basicPromptWithReentry(`${name} was from ${location}. They last competed in ${team.mostRecentEventYear}`);
        }
      });
}

const getTeamAge = (conv, params) => {
  const team_number = params["team"];

  return getTeamWithActiveStatus(team_number, false)
      .catch((err) => {
        console.warn(err);
        return basicPromptWithReentry(`I couldn't find ${team_number}'s age.`);
      })
      .then((team) => {
        const name = frcUtil.nicknameOrNumber(team);
        
        if (team.isActive) {
          if (team.isRookie) {
            return basicPromptWithReentry(`${name} is a rookie team.`);
          } else {
            const thisYear = new Date().getFullYear();
            const age = thisYear - team.rookie_year;
            return basicPromptWithReentry(`${name} is ${age} years old.`);
          }
        } else {
          const age = team.mostRecentEventYear - team.rookie_year;
          return basicPromptWithReentry(`${name} competed for ${age} years. They last competed in ${team.mostRecentEventYear}.`);
        }
      });
}

const getTeamInfo = (conv, params) => {
  const team_number = params["team"];

  const seasonContext = conv.contexts.get("season")
  let year;
  if (seasonContext) {
    year = seasonContext.season
  }

  return getTeamWithActiveStatus(team_number)
      .catch((err) => {
        console.warn(err);
        return basicPromptWithReentry(`I couldn't find information on ${team_number}.`);
      })
      .then((team) => {
        const name = `${team.nickname} (FRC team ${team_number})`;
        const thisYear = new Date().getFullYear();
        const location = frcUtil.getLocationString(team);

        let response;
        if (team.isActive) {
          const age = thisYear - team.rookie_year;

          let ageString;
          if (team.isRookie) {
            ageString = "rookie"
          } else {
            ageString = `${age} year old`
          }

          response = basicPromptWithReentry(`${name} is a ${ageString} team from ${location}.`);
          response.screenContent = createTeamCard(team, year)
        } else {
          const age = team.mostRecentEventYear - team.rookie_year;
          response = basicPromptWithReentry(`${name} from ${location} competed for ${age} years. They last competed in ${team.mostRecentEventYear}.`);
          response.screenContent = createTeamCard(team, team.mostRecentEventYear)
        }

        return response;
      });
}

const getRobotName = (conv, params) => {
  const team_number = params["team"];
  const date = params["date"];
  const season = params["season"];
  let year;

  const currentYear = new Date().getFullYear();
  if (date) {
    year = new Date(date).getFullYear();
  } else if (season) {
    year = season;
  } else {
    year = currentYear;
  }

  conv.contexts.set("season", 5, { "season": year });

  return tba.getTeam(team_number)
      .catch((err) => {
        console.warn(err);
        basicPromptWithReentry(`I couldn't find ${team_number}'s robot name for ${year}.`);
      })
      .then((data) => {
        if (data[year] === undefined) {
          console.warn(`No data for ${year}`);
          return basicPromptWithReentry(`I couldn't find ${team_number}'s robot name for ${year}.`);
        } else {
          const join = year === currentYear ? "is" : "was";
          const robotName = data[year].name;
          return basicPromptWithReentry(`FRC team ${team_number}'s ${year} robot ${join} ${robotName}`);
        }
      })
}

const getTeamEvents = (conv, params) => {
  const team_number = params["team"];
  const year = frcUtil.getYearOrThisYear(params, conv.contexts);

  conv.contexts.set("season", 5, { "season": year });

  return tba.getTeamEvents(team_number, year)
      .catch((err) => {
        console.warn(err);
        return basicPromptWithReentry(`I couldn't find event information for ${team_number} during ${year}.`);
      })
      .then((data) => {
        const pastEvents = [];
        const upcomingEvents = [];
        const now = new Date();
        data.forEach((event) => {
          if (new Date(event.end_date) < now) {
            pastEvents.push(event);
          } else {
            upcomingEvents.push(event);
          }
        })

        let response;
        const hasPastEvents = pastEvents.length > 0;
        const hasUpcomingEvents = upcomingEvents.length > 0;
        if (hasPastEvents) {
          response = `${team_number} was registered for `;

          response += frcUtil.joinToOxfordList(pastEvents, (event) => event.name);
          response += ".";
        }

        if (hasUpcomingEvents) {
          if (hasPastEvents) {
            response += "They will also be competing at ";
          } else {
            response = `${team_number} is registered for `;
          }

          response += frcUtil.joinToOxfordList(upcomingEvents, (event) => event.name);
          response += ".";
        }

        if (!hasPastEvents && !hasUpcomingEvents) {
          response = `${team_number} is not registered for any ${year} events.`;
        }

        if (data.size === 1) {
          conv.contexts.set("event", 5, { "event": data[0].key });
        }

        const prompt = basicPromptWithReentry(response);
        if (data.length > 1) {
          prompt.screenContent = eventCards.createMultiEventCard(data);
        } else if (data.length === 1) {
          prompt.screenContent = eventCards.createEventCard(data[0]);
        }
        return prompt;
      })
}

// TODO use awards.js
const getTeamAwards = (conv, params) => {
  const team_number = params["team"];
  const season = frcUtil.getYearOrThisYear(params, conv.contexts);

  if (season) {
    conv.contexts.set("season", 5, { "year": season });
  }

  return tba.getTeamAwards(team_number, season)
      .catch((err) => {
        console.warn(err);
        let response = `I couldn't find award information for ${team_number}`;
        if (season) {
          response += ` during ${season}.`;
        } else {
          response += ".";
        }
        return basicPromptWithReentry(response);
      })
      .then((data) => {
        let response
        if (data.length === 0) {
          if (season) {
            response = `${team_number} did not win any awards in ${season}.`;
          } else {
            response = `${team_number} has not won an award yet.`;
          }
          return basicPromptWithReentry(response);
        }

        const allAwards = groupBy(data, 'year');
        const years = [];
        var year;
        for (year in allAwards) {
          years.push(year);
        }
        const latestYear = Math.max.apply(null, years);
        const awards = allAwards[latestYear];

        response = `In ${latestYear}, team ${team_number} won `;

        const awardsByType = groupBy(awards, 'award_type');
        const awardStrings = [];
        Object.keys(awardsByType).forEach((type) => {
            const instances = awardsByType[type];
            let awardName = instances[0].name;
            const count = instances.length;

            let suffix = "";
            switch (type) {
              case "1": {
                // Event winner
                // TODO group by award name
                if (count === 1) {
                  awardStrings.unshift("1 event");
                } else {
                  awardStrings.unshift(`${count} events`);
                }
                break;
              }

              case "2": {
                // Event finalist
                // TODO group by award name
                if (count === 1) {
                  awardStrings.push("1 event finalist award");
                } else {
                  awardStrings.push(`${count} event finalist awards`);
                }
                break;
              }

              case "5": {
                // Volunteer of the year
                if (count === 1) {
                  awardStrings.push("one Volunteer of the Year award");
                } else {
                  awardStrings.push(`${count} Volunteer of the Year awards`);
                }
                break;
              }

              case "68": {
                // Wildcard
                if (count === 1) {
                  awardStrings.push("1 wildcard");
                } else {
                  awardStrings.push(`${count} wildcards`);
                }
                break;
              }

              default: {
                if (count === 1) {
                  awardStrings.push(`the  ${awardName}${suffix}`);
                } else {
                  awardName = awardName.replace(/award /ig, "Awards ");
                  awardStrings.push(`${count} ${awardName}${suffix}`);
                }
              }
            }
        })

        response += frcUtil.joinToOxfordList(awardStrings);
        response += ".";

        return basicPromptWithReentry(response);
      })
}

const getTeamChampionship = (conv, params) => {
  const eventUtil = require('../events');
  const team_number = params["team"];
  const year = frcUtil.getYearOrThisYear(params);

  conv.contexts.set("season", 5, { "season": year });

  let team;
  return tba.getTeam(team_number)
      .then(teamInfo => {
        team = teamInfo;
        return tba.getTeamEvents(team_number, year)
      }).catch((err) => {
        console.warn(err);
        return basicPromptWithReentry(`I couldn't find event information for ${team_number} during ${year}.`);
      }).then((events) => {
        
        let cmpEvents;
        if (events.length === 0) {
          cmpEvents = [];
        } else {
          cmpEvents = events.filter(event => event.event_type === eventUtil.EVENT_TYPE_CMP_FINALS
            || event.event_type === eventUtil.EVENT_TYPE_CMP_DIVISION);
        }

        const teamName = frcUtil.nicknameOrNumber(team);
        const now = new Date();
        const thisYear = now.getFullYear();
        
        let cmpCity;
        if (year === 2017) {
          cmpCity = team.home_championship["2017"];
        } else {    
          cmpCity = team.home_championship["2018"];
        }
      
        // If the team is/was not registered for a championship event, only return the championship assignment
        if (cmpEvents.length === 0) {
          if (year < 2017) {
            return basicPromptWithReentry(`In ${year} there was only one championship event.`);
          }

          if (year < thisYear) {
            return basicPromptWithReentry(`${teamName} was assigned to the ${cmpCity} championship in ${year}.`);
          } else {
            return basicPromptWithReentry(`${teamName} is assigned to the ${cmpCity} championship.`);
          }
        }

        // If the team actually competed at a championship event, return information on where they competed
        const divisions = cmpEvents.filter(event => event.event_type === eventUtil.EVENT_TYPE_CMP_DIVISION);
        if (divisions.length === 0) {
          // One championship event, no division. Must be an old event!
          const cmpEvent = cmpEvents[0];
          const prompt = basicPromptWithReentry(`${teamName} competed at the ${year} ${cmpEvent.name} in ${cmpEvent.city}.`);
          prompt.screenContent = eventCards.createEventCard(cmpEvent);
          return prompt;
        }

        let response;
        if (year < 2017) {
          // One champ, should only be one division to worry about.
          const divisionName = divisions[0].name;
          response = `${teamName} competed in the ${divisionName} in ${year}.`;
        } else {
          if (year < thisYear) {
            response = `${teamName} was assigned to the ${cmpCity} championship in ${year}.`;
          } else {
            response = `${teamName} is assigned to the ${cmpCity} championship in ${year}.`;
          }

          if (divisions.length === 1) {
            if (new Date(divisions[0].end_date) < now) {
              response += ` They competed in the ${divisions[0].name}.`
            } else {
              response += ` They will be competing in the ${divisions[0].name}.`
            }
          } else {
            divisions.forEach(division => {
              if (new Date(division.end_date) < now) {
                reponse += ` They competed in the ${division.name} in ${division.city}.`
              } else {
                response += ` They will be competing in the ${division.name} in ${division.city}.`
              }
            });
          }
        }

        const prompt = basicPromptWithReentry(response);
        if (cmpEvents.length > 1) {
          prompt.screenContent = eventCards.createMultiEventCard(cmpEvents);
        } else if (cmpEvents.length === 1) {
          prompt.screenContent = eventCards.createEventCard(cmpEvents[0]);
        }
        return prompt;
      })
}

const intents = {
  'team-rookie-year': getRookieYear,
  'team-info': getTeamInfo,
  'team-location': getTeamLocation,
  'team-age': getTeamAge,
  'team-nickname': getTeamNickName,
  'team-robot-name': getRobotName,
  'team-name': getTeamName,
  'team-events': getTeamEvents,
  'team-awards': getTeamAwards,
  'team-championship': getTeamChampionship
}

module.exports.team = (conv, params) => {
  const responsePromise = intents[conv.intent](conv, params);
  return responsePromise.then((response) => {
    return prompt(conv, response);
  })
  .catch((err) => {
    console.warn(err);
    return fallback(conv);
  });
}