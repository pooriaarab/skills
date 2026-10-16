# API

Base: http://127.0.0.1:8890.

## HTTP

- GET /api/status and /api/frame.jpg.
- POST /api/tap {x,y}.
- POST /api/swipe {x1,y1,x2,y2}.
- POST /api/scroll {x,y,lines}.
- POST /api/type {text}.
- POST /api/key {text}.
- POST /api/home.
- POST /api/back.
- POST /api/calibrate/start.
- POST /api/calibrate/finish {x,y}.
- POST /api/agent {text}.
- POST /api/agent/stop.
- POST /api/agent/clear.
- POST /api/raw {text} only when debug is on.

## Board lines

Board lines are ping, home, move dx dy, press, release, click, scroll v h, type ascii, key combo.

Keys: enter esc tab backspace space arrows cmd ctrl alt shift and one character.

## Values

- type is ASCII.
- Fractions are 0..1.
- The planner uses 0..1000.
- HTTP 409 means the board refused or the pointer is not calibrated.
- Empty LLM key means do not use /api/agent.
- The idle loop nudges the pointer by 1 and then -1. That is not a gesture.
