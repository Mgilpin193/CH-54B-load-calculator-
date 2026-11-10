# CH-54 Performance and Checklists

An iPad-friendly web app combining CH-54 performance planning, load calculations, weight reference, weight and balance, normal checklists, and emergency procedures.

## Open the app

https://mgilpin193.github.io/CH-54B-load-calculator-/

On an iPad, open the link in Safari. To install it, choose Share, then Add to Home Screen. Open the installed app while online once to cache its files before checking offline use.

## Aircraft and checklist availability

The performance selector includes CH-54A, CH-54A CMRB, CH-54B, and CH-54B CMRB. The Checklist and red Emergency tabs follow the selected aircraft.

- CH-54A normal checklist: loaded, with Complete, Postpone, Go back, and postponed-item review.
- After CH-54A engine 2 start: choose Ground Taxi or Before Takeoff. Ground Taxi then leads to Before Takeoff.
- CH-54A and CH-54B emergency procedures: loaded, with category menus and checkboxes.
- CH-54B normal checklist: not yet available.
- CMRB checklists and emergency procedures: unavailable pending confirmation of applicability.

Switching tabs retains the checklist position for the current page session. Performance entries are stored in the browser on that device. They are not sent to the website host.

## Review status

Checklist and emergency content is a review draft transcribed from supplied documents. Verify against current approved aircraft manuals, checklists, warnings, and limitations before operational use. Some source wording and external page references still require review.

## Offline updates

Keep the application assets in their existing relative paths. When publishing an update, increase CACHE_NAME in service-worker.js. Open the app online and refresh to load the update before using it offline.

GitHub Pages serves this public repository from the main branch at the repository root. App source, procedure text, and performance tables are publicly readable.

## Development check

Run node tests/aircraft-checklists.test.cjs to check aircraft routing, unavailable-checklist handling, and frame retention. No build step is required.