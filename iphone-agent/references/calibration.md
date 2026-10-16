# Calibration

- POST /api/calibrate/start homes the pointer and tries mouse distances 150 and 350.
- A moving widget makes the finder fail.
- It then leaves the pointer after move 200 200 and returns auto false.
- POST /api/calibrate/finish with the fraction where that pointer sits sets span w=200/x and h=200/y, clears learned points, and updates the live process.
- Writing ~/.hidagent/calibration.json does not update the live process.
- Do not restart hidagent to load a file.

## Verify

- Verify with raw home, then move (0.5*w) (0.5*h), then look at the frame.
- The grey circle should sit near the center.
- Do not tap during that check.
- A tall vertical move can open the AssistiveTouch menu.
- Recover with raw release, then raw home.
- Trust the grey circle in the picture, not a bright icon.
- /api/raw is 404 unless HIDAGENT_DEBUG=1.

## Span

- One measured phone used span w 377 and h 985.
- Every phone needs its own finish.
