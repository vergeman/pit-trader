#
# scratchpad media pipe demo
# https://google.github.io/mediapipe/solutions/hands.html
#
from Landmark import Landmark
import cv2
import mediapipe as mp
import csv

def output_csv_all(key, landmark):

  if key == -1: return
  csv_path = '/home/jovyan/data/landmarks.csv'

  with open(csv_path, 'a', newline="") as _file:
    writer = csv.writer(_file)

    # flattened size
    # key -> 1, Capture Width -> 1, Capture Height -> 1,
    # Left(x,y,z *21) -> 63, Right(x,y,z *21) -> 63, face(x,y * 6) -> 12
    # len 141 total
    row = [key] + landmark.to_row()
    writer.writerow(row)

print("WEBCAM")

cap = cv2.VideoCapture(0)

# Capture Dims
# ffmpeg -f video4linux2 -list_formats all -i /dev/video0
# YUYV 4:2:2 : 640x480 160x120 320x180 320x240 424x240 640x360 640x480
# Motion-JPEG : 848x480 960x540 1280x720
#
# to enable motion jpeg and larger window below
# keep at default for now (640 x 480)
#
#fourcc = cv2.VideoWriter_fourcc(*'MJPG')
#cap.set(cv2.CAP_PROP_FOURCC, fourcc)
#cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
#cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
#
# default 640x480
#print("WIDTH", cap.get(cv2.CAP_PROP_FRAME_WIDTH))
#print("HEIGHT", cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

print( cap.isOpened() )


mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles
mp_hands = mp.solutions.hands
mp_face_detection = mp.solutions.face_detection


landmark = Landmark()

# For static images:
# IMAGE_FILES = []
# with mp_hands.Hands(0
#     static_image_mode=True,
#     max_num_hands=2,
#     min_detection_confidence=0.5) as hands:
#   for idx, file in enumerate(IMAGE_FILES):
#     # Read an image, flip it around y-axis for correct handedness output (see
#     # above).
#     image = cv2.flip(cv2.imread(file), 1)
#     # Convert the BGR image to RGB before processing.
#     results = hands.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))

#     # Print handedness and draw hand landmarks on the image.
#     print('Handedness:', results.multi_handedness)
#     if not results.multi_hand_landmarks:
#       continue
#     image_height, image_width, _ = image.shape
#     annotated_image = image.copy()
#     for hand_landmarks in results.multi_hand_landmarks:
#       print('hand_landmarks:', hand_landmarks)
#       print(
#           f'Index finger tip coordinates: (',
#           f'{hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP].x * image_width}, '
#           f'{hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP].y * image_height})'
#       )
#       mp_drawing.draw_landmarks(
#           annotated_image,
#           hand_landmarks,
#           mp_hands.HAND_CONNECTIONS,
#           mp_drawing_styles.get_default_hand_landmarks_style(),
#           mp_drawing_styles.get_default_hand_connections_style())
#     cv2.imwrite(
#         '/tmp/annotated_image' + str(idx) + '.png', cv2.flip(annotated_image, 1))
#     # Draw hand world landmarks.
#     if not results.multi_hand_world_landmarks:
#       continue
#     for hand_world_landmarks in results.multi_hand_world_landmarks:
#       mp_drawing.plot_landmarks(
#         hand_world_landmarks, mp_hands.HAND_CONNECTIONS, azimuth=5)


#For webcam input:
with mp_hands.Hands(
    model_complexity=0,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5) as hands,\
mp_face_detection.FaceDetection(
    model_selection=0, min_detection_confidence=0.5) as face_detection:

  while cap.isOpened():
    success, image = cap.read()
    if not success:
      print("Ignoring empty camera frame.")
      # If loading a video, use 'break' instead of 'continue'.
      continue

    # To improve performance, optionally mark the image as not writeable to
    # pass by reference.
    # need to convert opencv (BGR) to RGB for media hands process
    image.flags.writeable = False
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # hands orientation assumes input is 'selfie mode' (flip)
    # image needs to be flipped prior to feeding it for processing
    # for proper hand label
    image = cv2.flip(image, 1)

    resultsHands = hands.process(image)
    resultsFace = face_detection.process(image)
    image.flags.writeable = True
    # need to convert back to rgb for proper display
    # convert to use lib, convert back to display
    # want to convert before drawing landmarks or else landmarks
    # also get converted (unintended)
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

    # KeyPress input
    # will wait for N ms or until key is pressed (whichever sooner)
    # NB: large values hang input loop
    key = cv2.waitKey(5)
    #print("K", key)

    #
    # Draw the hand annotations on the image.
    # assume multiple hands per frame is possible
    #
    print("---------------------------")

    # Handedness
    # assumes selfie mode
    landmark.setWidth( cap.get(cv2.CAP_PROP_FRAME_WIDTH) )
    landmark.setHeight( cap.get(cv2.CAP_PROP_FRAME_HEIGHT) )

    landmark.setHandedness(resultsHands.multi_handedness)

    landmark.setHandLandmarks(resultsHands.multi_hand_landmarks)

    landmark.setFaceDetections(resultsFace.detections)

    output_csv_all(key, landmark)
    #print(landmark.to_row())
    #
    # DRAW
    #
    if resultsHands.multi_hand_landmarks:

      for hand_landmarks in resultsHands.multi_hand_landmarks:

        mp_drawing.draw_landmarks(
            image,
            hand_landmarks,
            mp_hands.HAND_CONNECTIONS,
            mp_drawing_styles.get_default_hand_landmarks_style(),
            mp_drawing_styles.get_default_hand_connections_style())

    #
    # draw face detection
    # loop can detect multiple faces per frame
    #
    if resultsFace.detections:

      for detection in resultsFace.detections:

        mp_drawing.draw_detection(image, detection)

        #output_csv_face(key, detection.location_data)
        # detection.location_data.relative_bounding_box
        # { xmin, ymin, width,height }
        #
        # detection.location_data.relative_keypoints
        # len 6 array of x,y pairs normalized points (see docs)
        # [ {x,y}, {x,y}...]
        #output_csv_

    # resize input
    # Flip the image horizontally for a selfie-view display.

    # are landmarks normalized, independent of webcam dims?
    # image = cv2.resize(image, (800, 400))


    # ifnalize
    # csv_write(landmark)
    cv2.imshow('MediaPipe Hands + Face', image)

    if cv2.waitKey(5) & 0xFF == 27:
      break


cap.release()
