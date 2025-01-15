# Pit Trader

[![.github/workflows/build-test.yml](https://github.com/vergeman/pit-trader/actions/workflows/build-test.yml/badge.svg)](https://github.com/vergeman/pit-trader/actions/workflows/build-test.yml)

Welcome to the Pit.

Make your fortune in the open outcry pits. Learn the hand signals and scalp your
way to profit!

### [Pit Trader Live: https://www.thepittrader.com/](https://www.thepittrader.com/)

https://github.com/vergeman/pit-trader/assets/797301/1442c6b6-cebf-496a-a12a-63a4024f8bb7


## Project Layout

* [`/train`](train): Training data webcam capture and labeling using opencv +
  mediapipe.

* [`/model`](model): notebook(s) ingest training data for NN, Logistic
  Regression and SVC classifiers. Current deploy uses Logistic Regression.

* [`/web`](web): React-based game. Uses ONNX runtime and mediapipe for live
  inference.


----

## Docker Dev Notes

### Quickstart Dev

1. Clone this repository
2. `docker compose up`
3. Pit Trader game: `http://localhost:3000`
4. Training and model environments:

```

#
# Models: get access url for notebooks via jupyter server logs
#

docker logs pit-trader_pytorch-minimal-notebook_1


#
# Train: Python env
#

./docker_run.sh
python train/webcam_trainer.py


#
# Frontend Game Env
#
./docker_run_web.sh
npm test
npm run lint
```


#### Dependent Images:

`pytorch-minimal-notebook`:`
  * jupyter/minimal-notebook:notebook-6.4.12
  * python related packages: conda, pytorch, opencv (cv2), mediapipe
  * Note: this is a large image

`web`:
  * node:2.12.0

#### X windows + Camera Setup in Docker

These are taken care of in `docker-compose.yml`, `docker_run.sh`, but are noted
here:

* To "receive" GUI run: `xhost +local:docker` on host before entering docker
  environment.
* `docker exec` necessary to pass `DISPLAY` env variable
* Need to bind mount `/tmp/.X11-unix`


##### `/dev/video0`
* `user:root` needed to access `dev/video0` webcam and [docker group with
privileges](https://docs.docker.com/engine/install/linux-postinstall/)
* Ensure `docker-compose.yml`: webcam mapped at `/dev/video0` for training in
  `pytorch-minimal-notebook` container.