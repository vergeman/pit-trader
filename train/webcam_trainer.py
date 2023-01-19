# webcam_trainer.py
#
# scratchpad media pipe demo
# https://google.github.io/mediapipe/solutions/hands.html
#
from Landmark import Landmark
from KeyClassMapping import KeyClassMapping
import cv2
import mediapipe as mp
import csv

def output_csv_all(keyMapVal, landmark):

  if keyMapVal is None: return

  csv_path = '/home/jovyan/train/data/landmarks.csv'

  with open(csv_path, 'a', newline="") as _file:
    writer = csv.writer(_file)

    # flattened size: see Landmark.py
    # label class (keyMapVal.index) -> 1
    # Hand: 21 points, each with 3 (x,y,z) coordinates
    # Face: 6 points, each with 2 (x,y) coordinates
    # Left -> 63, Right -> 63, face -> 12
    # label + 2*hands + face
    # 1 + 2*63 + 12 = 1 + 126 + 12 = 139

    print(keyMapVal)
    label = keyMapVal.get('index')
    # label = 15 # for manual class override
    row = [label] + landmark.to_row()
    writer.writerow(row)

print("WEBCAM")

cap = cv2.VideoCapture(0)
print( cap.isOpened() )


mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles
mp_hands = mp.solutions.hands
mp_face_detection = mp.solutions.face_detection

landmark = Landmark()
keyClassMapping = KeyClassMapping()

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

    keyVal = keyClassMapping.getKeyVal(key)

    #
    # Draw the hand annotations on the image.
    # assume multiple hands per frame is possible
    #
    # print("---------------------------")

    # Handedness
    # assumes selfie mode
    landmark.setWidth( cap.get(cv2.CAP_PROP_FRAME_WIDTH) )
    landmark.setHeight( cap.get(cv2.CAP_PROP_FRAME_HEIGHT) )

    # set and re-orient coords around relative base point
    landmark.setBasePoints(resultsFace.detections,
                               mp_face_detection.FaceKeyPoint.NOSE_TIP)

    landmark.setHandLandmarks(resultsHands)

    landmark.setFaceDetections(resultsFace.detections)

    output_csv_all(keyVal, landmark)

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


    # resize input
    # Flip the image horizontally for a selfie-view display.

    # are landmarks normalized, independent of webcam dims?
    # image = cv2.resize(image, (800, 400))

    # finalize
    # csv_write(landmark)
    cv2.imshow('MediaPipe Hands + Face', image)

    if cv2.waitKey(5) & 0xFF == 27:
      break


cap.release()
