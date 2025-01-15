#!/usr/bin/bash
# did you remember
# xhost +local:docker

docker exec -e DISPLAY=$DISPLAY -it pit-trader_pytorch-minimal-notebook_1 \
       bash
       #python data/test_webcam.py