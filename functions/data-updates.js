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

const functions = require('firebase-functions');

/**
 * Event synonyms that we don't get from the API.
 * Generally these are more colloquial ways to say the names
 * of particular events
 */
const extraEventNames = {
  mnmi: ["10,000 Lakes Regional"],
  mnmi2: ["North Star Regional"]
};

module.exports.DataUpdates = class DataUpdates {

  constructor (tbaClient) {
    this.tba = tbaClient;
  }

  updateTeams() {
    const teams = [];
    return this._buildTeamListRecursive(teams, 0)
      .then(teams => {
        console.log("got " + teams.length + " teams");
        return this._setTeams(teams);
      })
      .catch(err => {
        console.error("Error updating teams", err);
      });
  }

  _buildTeamListRecursive(teams, page) {
    return this.tba.getTeamList(page)
      .then(data => {
        if (data.length > 0) {
          data.forEach((team) => {
            const entity = { value: team.team_number };
    
            entity.synonyms = [
              team.team_number,
              "team " + team.team_number,
              "team number " + team.team_number,
              "FRC team " + team.team_number,
              "FRC team number " + team.team_number
            ];
            if (team.nickname) {
              entity.synonyms.push(this._normalizeNickname(team.nickname));
            }
    
            teams.push(entity);
          });
    
          return this._buildTeamListRecursive(teams, ++page);
        } else {
          return Promise.resolve(teams);
        }
      })
      .catch(err => {
        // TODO better handling
        console.error(err);
      });
  }

  _normalizeNickname(name) {
    return name.replace(/[^\w\s]/gi, '');
  }

  updateEvents() {
    const events = new Map();
    const startYear = 1992;
    return this._buildEventListRecursive(events, startYear)
      .then(events => {

        const entries = [];
        events.forEach((value, key) => {
          entries.push({ value: key, synonyms: value });
        });

        console.log("got " + entries.length + " events");

        return this._setEvents(entries);
      })
      .catch(err => {
        console.error("Error updating events", err);
      });
  }

  _buildEventListRecursive(events, year) {
    return this.tba.getEventList(year)
      .then(data => {
        if (data.length > 0) {
          data.forEach((event) => {
            let synonyms;
            if (events.has(event.event_code)) {
              synonyms = events.get(event.event_code);
            } else {
              synonyms = [ event.event_code ];

              const additionalNames = extraEventNames[event.event_code];
              if (additionalNames) {
                additionalNames.forEach((name) => { this._addEventNameToSynonyms(synonyms, name) });
              }
            }
          
            if (event.name) {
              this._addEventNameToSynonyms(synonyms, event.name);
            }
    
            events.set(event.event_code, synonyms);
          });
    
          return this._buildEventListRecursive(events, ++year);
        } else {
          return Promise.resolve(events);
        }
      }, _ => {
        return Promise.resolve(events);
      })
      .catch(err => {
        // TODO better handling
        console.error(err);
      });
  }

  _addEventNameToSynonyms(synonyms, name) {
    const normalized = name.replace(/\(|\)/g, "");

    if (!synonyms.includes(normalized)) {
      synonyms.push(normalized);

      if (normalized.includes("Regional") || normalized.includes("regional")) {
        const stripped = normalized.replace(/regional/ig, '');
        synonyms.push(stripped);
      }
    }
  }

  _setTeams(teams) {
    const entityId = functions.config().entities.teams;
    return this._setEntities(entityId, teams);
  }

  _setEvents(events) {
    const entityId = functions.config().entities.events;
    return this._setEntities(entityId, events);
  }

  _setEntities(entityType, entities) {
    const dialogflow = require('dialogflow');
    const entityTypesClient = new dialogflow.EntityTypesClient();
    

    const projectId = process.env.GCLOUD_PROJECT;
    const entityTypePath = entityTypesClient.entityTypePath(projectId, entityType);
    
    const getEntityTypeRequest = {
      name: entityTypePath,
    };

    return entityTypesClient
      .getEntityType(getEntityTypeRequest)
      .then(responses => {
        const entityType = responses[0];
        entityType.entities = entities;
        const request = {
          entityType: entityType,
        };

        return entityTypesClient.updateEntityType(request)
          .then(_ => {
            console.log('Updated entity');
            return Promise.resolve();
          })
          .catch(err => {
            console.error('Failed to update entity', err);
          })
      })
      .catch(err => {
        console.error('Failed to update entity', err);
      });
  }
}