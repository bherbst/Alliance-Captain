# DialogFlow Agent for Alliance Captain
This is an export of the DialogFlow agent used for Alliance Captain.

You can zip this directory and import it into DialogFlow.

### Note on Entities
Manually created entity entries should be included here.
Dynamically populated entities should not be included.

Current the `team` and `event` entities are populated on a regular basis via a cron job.
Since that data changes regularly, these entities would become out of date very quickly if included here.