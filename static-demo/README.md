# Web Frontend

Onnx runtime doesn't have any real operators, just runs an exported
model

run `python3 -m http.server` in `/web` to run a local
server: [http://localhost:8000/](http://localhost:8000/)

Currently has static inputs - an "A-A" model - to verify matching
outputs with pytorch.
