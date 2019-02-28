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

/**
 * Utility functions
 */

// Get a team's nickname or a number string if no nickname is defined
exports.nicknameOrNumber = function(team) {
    return team.nickname ? team.nickname : "FRC team " + team.team_number;
}

exports.getLocationString = function(team) {
    return team.country === "USA"
        ? team.city + ", " + team.state_prov
        : team.city + ", " + team.country;
}

exports.getEventLocation = function(event) {
    return event.country === "USA"
        ? event.city + ", " + event.state_prov
        : event.city + ", " + event.country;
}

exports.getEventLocationWithDistrict = function(event) {
  let result = exports.getEventLocation(event);
  if (event.district) {
    result += " — " + event.district.display_name + " district";
  }
  return result;
}

exports.getYearOrThisYear = function(params, contexts) {
  const season = params["season"];
  const datePeriod = params["date-period"];
  let seasonContext;
  if (contexts) {
    seasonContext = contexts.get("season");
  }

  let year;
  if (season) {
    year = season;
  } else if (datePeriod) {
    year = new Date(datePeriod.startDate).getFullYear()
  } else if (seasonContext) {
    year = seasonContext.season
  } else {
    year = new Date().getFullYear();
  }

  return year;
}

exports.joinToOxfordList = function(list, mapFunc) {
    if (mapFunc === undefined) {
      mapFunc = (it) => it;
    }

    let listString = "";
    if (list.length === 1) {
      listString += mapFunc(list[0]);
    } else if (list.length === 2) {
      listString += list.map(mapFunc).join(' and ');
    } else {
      listString += list.map(mapFunc).slice(0, -1).join(', ');
      listString += ' and ';
      listString += list.map(mapFunc).slice(-1);
    }
    return listString;
}