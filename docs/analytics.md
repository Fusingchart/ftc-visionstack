# Adoption and analytics

Analytics is disabled by default. Create a site in Plausible, then put the HTTPS URL of its site-specific JavaScript snippet in the GitHub repository Actions variable `PLAUSIBLE_SCRIPT_URL`. Deploy the workflow and check a visited page in Plausible. Configure the custom events `Code copied`, `GitHub clicked` and `Trial report prepared`. The script variable contains a public script URL. Keep provider credentials out of the source repository.

The form prepares a browser-local draft. The last event counts drafts only. GitHub submissions and verified adoption require a separate manual review. Never share student names, identifiers, raw IP addresses or personal contact information in analytics properties. The goal is 10,000 verifiable content views by January 23, 2027.

| Dashboard measure | Definition and display |
| --- | --- |
| Content pageviews | Cumulative pageviews to course lessons, projects, cookbook recipes, troubleshooting articles, and labs. Display actual vs 10,000 and remaining views. |
| Daily and weekly volume | Aggregate using America/Los_Angeles. Show reporting period, most recent refresh and weekly trend. |
| Unique visitors | Provider-defined estimate over the selected period. Keep it separate from team adoption. |
| Acquisition | Landing pages, referrers, workshop links and campaign UTMs. Use source, medium and campaign labels without personal details. |
| Engagement | Pageviews by route and content type, copy events, GitHub clicks and trial drafts. Keep events separate from pageviews. |
| Verified team adoption | Deduplicate voluntary trial reports by team number and resource. Report attempted and successful implementations plus evidence type. Count verified team totals once per reporting period. |
| Video and social | Maintain separate video view and impression metrics with the platform and counting rules. |

Each weekly reporting snapshot should record the time zone, dates, exported page-level counts and filtering rule. Compare the weekly content-view pace with the remaining views divided by remaining days. Privacy controls and browser blockers can create missing visits. No production traffic or team adoption has been measured for this build.
