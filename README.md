# Dashboard build v2.2

This build contains the current corrections.

## Admin
Only the intended toggles remain. The following controls are completely absent from `admin.html`:
- Notice rotation
- Config check
- Page refresh

The Admin subtitle displays `v2.2` so the deployed version is easy to verify.

## Fixed timing
- Config reload check: 30 minutes
- Full page reload: 30 minutes
- Weather refresh: 10 minutes
- NWS alerts: 5 minutes
- Notice rotation: 10 seconds

## Clock
The clock now sizes itself from the width of its own panel using CSS container units. This prevents the last digit from being cut off or crossing into the video. Repeated numerals use positive tracking so values such as `44` remain separated.

## Dynamic background
Dynamic background remains a single On/Off setting. Sunrise/sunset blending uses a fixed internal 90-minute transition.
