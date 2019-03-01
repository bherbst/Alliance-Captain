
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

        let prompt;
        if (data.rookie_year >= new Date().getFullYear()) {
          prompt = basicPromptWithReentry(`${data.rookie_year} is ${name}'s rookie year.`);
        } else {
          prompt = basicPromptWithReentry(`${name}'s rookie year was ${data.rookie_year}.`);
        }

        prompt.suggestions = ["Awards", "Events", "Team info", "Championship info"];

        return prompt;
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
        const prompt = basicPromptWithReentry(`FRC team ${team_number}'s name is ${data.name}.`);
        prompt.suggestions = ["Awards", "Events", "Team info", "Championship info"];
        return prompt;
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
        const prompt = basicPromptWithReentry(`FRC team ${team_number}'s nickname is ${data.nickname}.`);
        prompt.suggestions = ["Awards", "Events", "Team info", "Championship info"];
        return prompt;
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
        
        let prompt;
        if (team.isActive) {
          prompt = basicPromptWithReentry(`${name} is from ${location}.`);
        } else {
          prompt = basicPromptWithReentry(`${name} was from ${location}. They last competed in ${team.mostRecentEventYear}`);
        }
        
        prompt.suggestions = ["Awards", "Events", "Team info", "Championship info"];

        return prompt;
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
        
        let prompt;
        if (team.isActive) {
          if (team.isRookie) {
            prompt = basicPromptWithReentry(`${name} is a rookie team.`);
          } else {
            const thisYear = new Date().getFullYear();
            const age = thisYear - team.rookie_year;
            prompt = basicPromptWithReentry(`${name} is ${age} years old.`);
          }
        } else {
          const age = team.mostRecentEventYear - team.rookie_year;
          prompt = basicPromptWithReentry(`${name} competed for ${age} years. They last competed in ${team.mostRecentEventYear}.`);
        }

        prompt.suggestions = ["Awards", "Events", "Team info", "Championship info"];

        return prompt;
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
        
        response.suggestions = ["Awards", "Events", "Championship info"];

        return response;
      });
}

const getRobotName = (conv, params) => {
  const team_number = params["team"];
  const year = frcUtil.getYearOrThisYear(params, conv.contexts);

  conv.contexts.set("season", 5, { "season": year });

  return tba.getTeam(team_number)
      .catch((err) => {
        console.warn(err);
        basicPromptWithReentry(`I couldn't find ${team_number}'s robot name for ${year}.`);
      })
      .then((data) => {
        let prompt;
        if (data[year] === undefined) {
          console.warn(`No data for ${year}`);
          prompt = basicPromptWithReentry(`I couldn't find ${team_number}'s robot name for ${year}.`);
        } else {
          const join = year === currentYear ? "is" : "was";
          const robotName = data[year].name;
          prompt = basicPromptWithReentry(`FRC team ${team_number}'s ${year} robot ${join} ${robotName}`);
        }
        
        prompt.suggestions = ["Awards", "Events", "Team info", "Championship info"];

        return prompt;
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

        prompt.suggestions = ["Awards", "Team info", "Championship info"];

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
          const prompt = basicPromptWithReentry(response);
          prompt.suggestions = ["Events", "Team info", "Championship info"];
          return prompt;
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

        let prompt = basicPromptWithReentry(response);
        prompt.suggestions = ["Events", "Team info", "Championship info"];
        return prompt;
      })
}

const getTeamChampionship = (conv, params) => {
  const eventUtil = require('../eventKeys');
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

        prompt.suggestions = ["Awards", "Events", "Team info"];

        return prompt;
      })
}

const getTeamEventStatus = (conv, params) => {
  const eventsUtil = require('../eventKeys');
  const teamNumber = params["team"];
  const eventCode = params["event"];
  const year = frcUtil.getYearOrThisYear(params, conv.contexts);

  conv.contexts.set("season", 5, { "season": year });

  let eventName;
  let teamEventStatusPromise;
  if (eventCode) {
    const eventKey = eventsUtil.getEventKey(eventCode, year);
    teamEventStatusPromise = tba.getEvent(eventCode).then(event => {
      eventName = event.name;
      conv.contexts.set("event", 5, { "event": eventKey });
      return tba.getTeamEventStatus(teamNumber, eventKey);
    });
  } else {
    // Find active event, or most recent event
    teamEventStatusPromise = tba.getTeamEvents(teamNumber, year).then(events => {
      if (events.length === 0) {
        return Promise.reject(Error(`Team ${team_number} is not registered for any ${year} events.`));
      }

      let mostRecentEvent;
      events.forEach(event => {
        const isEventOver = eventsUtil.isEventOver(event);
        if (isEventOver) {
          if (mostRecentEvent === undefined) {
            mostRecentEvent = event;
          } else if (new Date(event.end_date) < new Date(mostRecentEvent.end_date)) {
            mostRecentEvent = event;
          }
        }

        if (eventsUtil.isEventActive(event)) {
          return Promise.resolve(event.key);
        }
      });

      if (mostRecentEvent) {
        return Promise.resolve(mostRecentEvent);
      } else {
        return Promise.reject(Error(`Team ${team_number} does not have any event data yet.`));
      }
    }).then(event => {
      eventName = event.name;
      conv.contexts.set("event", 5, { "event": event.key });
      return tba.getTeamEventStatus(teamNumber, event.key)
    });
  }

  return teamEventStatusPromise
      .catch((err) => {
        console.warn(err);
        if (err.message) {
          return basicPromptWithReentry(err.message);
        } else {
          return basicPromptWithReentry(`I couldn't find event status for team ${teamNumber}.`);
        }
      })
      .then(status => {
        if (status === null) {
          return basicPromptWithReentry(`Team ${teamNumber} is not registered for the ${year} ${eventName}.`);
        }

        let response = `Team ${teamNumber} `;
        if (status.playoff) {
          if (status.playoff.status === "won") {
            response += `won the ${year} ${eventName}. `;
          } else {
            switch (status.playoff.level) {
              case "f": response += `was a finalist at the ${year} ${eventName}. `; break;
              case "sf": response += `was a semi-finalist at the ${year} ${eventName}. `; break;
              case "q": response += `was a quarter-finalist at the ${year} ${eventName}. `; break;
            }
          }

          switch (status.alliance.pick) {
            case -1: response += `They were a backup team on alliance ${status.alliance.number}. `; break;
            case 0: response += `They were the captain of alliance ${status.alliance.number}. `; break;
            case 1: response += `They were the first pick of alliance ${status.alliance.number}. `; break;
            case 2: response += `They were the second pick of alliance ${status.alliance.number}. `; break;
            case 3: response += `They were the third pick of alliance ${status.alliance.number}. `; break;
          }

          response += `They were ranked ${status.qual.ranking.rank} during qualification matches.`;

          return basicPromptWithReentry(response);
        }

        if (status.qual.status === "completed") {
          return basicPromptWithReentry(`Team ${teamNumber} was ranked ${status.qual.ranking.rank} at the ${year} ${eventName}.`);
        } else {
          return basicPromptWithReentry(`Team ${teamNumber} is currently ranked ${status.qual.ranking.rank} at the ${year} ${eventName}.`);
        }

        // TODO
        // prompt.suggestions = ["Awards", "Team info", "Championship info"];
      })
}

const intents = {
  'team-rookie-year': getRookieYear,
  'team-info': getTeamInfo,
  'team-info-contextual': getTeamInfo,
  'team-location': getTeamLocation,
  'team-age': getTeamAge,
  'team-nickname': getTeamNickName,
  'team-robot-name': getRobotName,
  'team-name': getTeamName,
  'team-events': getTeamEvents,
  'team-events-contextual': getTeamEvents,
  'team-awards': getTeamAwards,
  'team-awards-contextual': getTeamAwards,
  'team-championship': getTeamChampionship,
  'team-championship-contextual': getTeamChampionship,
  'team-event-rank': getTeamEventStatus
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