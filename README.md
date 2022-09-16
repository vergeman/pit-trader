# Pit Trader


## Tentative Architecture

* Data Capture: opencv + mediapipe, generate labeled training data
  from webcam, and possibly other images.

* Model: notebook that will use labeled data, classify the gestures,
  build a model.

* Frontend: Deployed onnyx.js with model, use mediapipe + react for
  live inference and game layer.

Each looks like they'll be their own container. (python conda, notebook, js)



## Setup Notes

* sudo needed to access `dev/video0` webcam

#### X windows

* To "receive" GUI: `xhost +local:docker` on host
* running `docker exec` needs to set `DISPLAY` variable
* need to bind mount `/tmp/.X11-unix`


----

## TODO:

[] Separate out opencv and mediapipe to its own "build data" container
[] rename /data to /trainer
