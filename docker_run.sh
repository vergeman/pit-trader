#!/usr/bin/bash
# did you remember
# xhost +local:docker

#docker run --user root --device /dev/video0:/dev/video0 \
#       -e GRANT_SUDO=yes -e DISPLAY=$DISPLAY -v /tmp/.X11-unix:/tmp/.X11-unix \
#       -v /home/vergeman/dev/pit-trader/data:/home/jovyan/data \
#       -it pit-trader_pytorch-minimal-notebook python data/test_webcam.py

# run as exec lighter?

docker exec -e DISPLAY=$DISPLAY -it pit-trader_pytorch-minimal-notebook_1 \
       bash
       #python data/test_webcam.py

