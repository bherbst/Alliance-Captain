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

const {
    BasicCard,
    Button,
    BrowseCarousel,
    BrowseCarouselItem
} = require('actions-on-google');

const frcUtil = require('../frc-util.js');

exports.createEventCard = function(event) {
    return new BasicCard({
        title: event.name,
        subtitle: frcUtil.getEventLocationWithDistrict(event),
        text: `See event results and more on firstinspires.org`,
        buttons: new Button({
            title: `View event details and results`,
            url: `https://frc-events.firstinspires.org/${event.year}/${event.first_event_code}`
        })
    });
}

exports.createMultiEventCard = function(events) {
    // Browse carousels can only have up to 10 cards
    events = events.slice(0, 10)
    return new BrowseCarousel({
        items: events.map((event) => 
            new BrowseCarouselItem({
                title: event.name,
                url: `https://frc-events.firstinspires.org/${event.year}/${event.first_event_code}`,
                description: frcUtil.getEventLocationWithDistrict(event),
            })
        )
    });
}