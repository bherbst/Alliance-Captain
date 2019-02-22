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

/* eslint eqeqeq: "off" */

const MN_DULUTH1 = ["dmn", "mndu"];
const MN_MINNEAPOLIS1 = ["mn", "mnmi"];
const MN_MINNEAPOLIS2 = ["mn2", "mnmi2"];
const LONG_ISLAND1 = ["li", "ny1", "nyli1"];
const TEXAS_ALAMO = ["stx", "txsa"];
const TEXAS_DALLAS = ["da", "txda"];
const MN_MRI = ["mri", "mnri"];
const MN_EMCC = ["emcc", "mnemcc"];
const MN_MMR = ["mnmn", "mnmmr", "mmr"];
const CA_OC = ["caoc", "cair", "capl"];
const CA_LA = ["cala", "capo", "calb"];
const CENTRAL_VALLEY = ["caf", "cafr", "cama"];
const HEARTLAND = ["mokc2", "ksla"];
const MIAMI_VALLEY = ["ohmv", "ohsp"];
const QUEEN_CITY = ["ohc", "ohic"];
const SACRAMENTO = ["sac", "casa", "cada"];
const MN_MSHSL = ["mnsc", "mshsl", "mncmp"];
const ST_LOUIS = ["mo", "mosl"];

const CMPS = ["cmp", "cmpmi", "cmptx", "cmpmo"];

exports.EVENT_TYPE_CMP_FINALS = 4;
exports.EVENT_TYPE_CMP_DIVISION = 3;

exports.getEventKey = function (eventCode, year) {
    if (MN_DULUTH1.includes(eventCode)) {
        if (year >= 2013) {
            return `${year}mndu`;
        } else {
            return `${year}dmn`;
        }
    } else if (MN_MINNEAPOLIS1.includes(eventCode)) {
        if (year >= 2013) {
            return `${year}mnmi`;
        } else {
            return `${year}mn`;
        }
    } else if (MN_MINNEAPOLIS2.includes(eventCode)) {
        if (year >= 2013) {
            return `${year}mnmi2`;
        } else {
            return `${year}mn2`;
        }
    } else if (LONG_ISLAND1.includes(eventCode)) {
        if (year >= 2013) {
            return `${year}nyli`;
        } else if (year >= 2002) {
            return `${year}li`;
        } else {
            return `${year}ny1`;
        }
    } else if (TEXAS_ALAMO.includes(eventCode)) {
        if (year >= 2013) {
            return `${year}txsa`;
        } else {
            return `${year}stx`;
        }
    } else if (TEXAS_DALLAS.includes(eventCode)) {
        if (year >= 2013) {
            return `${year}txda`;
        } else {
            return `${year}da`;
        }
    } else if (MN_MRI.includes(eventCode)) {
        if (year >= 2016) {
            return `${year}mnri`;
        } else {
            return `${year}mri`;
        }
    } else if (MN_EMCC.includes(eventCode)) {
        if (year >= 2018) {
            return `${year}emcc`;
        } else {
            return `${year}mnemcc`;
        }
    } else if (MN_MMR.includes(eventCode)) {
        if (year >= 2018) {
            return `${year}mmr`;
        } else if (year >= 2017) {
            return `${year}mnmn`;
        } else {
            return `${year}mnmmr`;
        }
    } else if (CA_OC.includes(eventCode)) {
        if (year >= 2019) {
            return `${year}caoc`;
        } else if (year >= 2017) {
            return `${year}cair`;
        } else {
            return `${year}capl`;
        }
    } else if (CA_LA.includes(eventCode)) {
        if (year >= 2019) {
            return `${year}cala`;
        } else if (year >= 2018) {
            return `${year}capo`;
        } else {
            return `${year}calb`;
        }
    } else if (CENTRAL_VALLEY.includes(eventCode)) {
        if (year >= 2018) {
            return `${year}cafr`;
        } else if (year >= 2015) {
            return `${year}cama`;
        } else {
            return `${year}caf`;
        }
    } else if (HEARTLAND.includes(eventCode)) {
        if (year >= 2019) {
            return `${year}ksla`;
        } else {
            return `${year}mokc2`;
        }
    } else if (MIAMI_VALLEY.includes(eventCode)) {
        if (year >= 2018) {
            return `${year}ohmv`;
        } else {
            return `${year}ohsp`;
        }
    } else if (QUEEN_CITY.includes(eventCode)) {
        if (year >= 2014) {
            return `${year}ohci`;
        } else if(year >= 2013) {
            return `${year}ohic`;
        } else {
            return `${year}ohc`;
        }
    } else if (SACRAMENTO.includes(eventCode)) {
        if (year >= 2016) {
            return `${year}cada`;
        } else if(year >= 2013) {
            return `${year}casa`;
        } else {
            return `${year}sac`;
        }
    } else if (MN_MSHSL.includes(eventCode)) {
        if (year == 2015 || year == 2016 || year == 2018) {
            return `${year}mnsc`;
        } else if(year == 2017) {
            return `${year}mncmp`;
        } else {
            return `${year}mshsl`;
        }
    } else if (ST_LOUIS.includes(eventCode)) {
        if (year >= 2015) {
            return `${year}mosl`;
        } else {
            return `${year}mo`;
        }
    } else {
        return `${year}${eventCode}`;
    }
}

exports.isChampionship = function(eventCode) {
    return CMPS.includes(eventCode);
}