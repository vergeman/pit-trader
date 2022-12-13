# Pit Trader


## Tentative Architecture

* `/train`: Data Capture using opencv + mediapipe, generate labeled
  training data from webcam, and possibly other images.

* `/model`: notebook(s) ingests labeled data, classifies the gestures,
  build a model.

* `/app`: Deployed onnyx.js with model, use mediapipe + react for live
  inference and maybe game layer.


## Docker Related Setup

#### X windows + Camera Setup

* see `docker-compose.yml` and `docker_run.sh`
* To "receive" GUI: `xhost +local:docker` on host
* `docker exec` necessary to pass `DISPLAY` env variable
* sudo needed to access `dev/video0` webcam
* need to bind mount `/tmp/.X11-unix`


## Media Pipe Notes

#### Hand Landmarks

Source: https://github.com/google/mediapipe/blob/master/mediapipe/python/solutions/hands.py

* Coordinates are normalized, relative to size of window
* example to get pixel position: `hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP].x * image_width`


#### Changing Capture Dimensions

Capture Dims
`ffmpeg -f video4linux2 -list_formats all -i /dev/video0`
YUYV 4:2:2 : 640x480 160x120 320x180 320x240 424x240 640x360 640x480
Motion-JPEG : 848x480 960x540 1280x720

To enable motion jpeg and larger window below keep at default for now (640 x 480)

```

fourcc = cv2.VideoWriter_fourcc(*'MJPG')
cap.set(cv2.CAP_PROP_FOURCC, fourcc)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

# default 640x480
print("WIDTH", cap.get(cv2.CAP_PROP_FRAME_WIDTH))
print("HEIGHT", cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

```

----
