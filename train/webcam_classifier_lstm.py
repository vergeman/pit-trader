# webcam_trainer_lstm.py
#
# scratchpad media pipe demo
# https://google.github.io/mediapipe/solutions/hands.html
#
from Landmark import Landmark
from KeyClassMapping import KeyClassMapping
from Meta import Meta
import cv2
import mediapipe as mp
import csv
import torch
import numpy as np
from collections import deque
softmax = torch.nn.Softmax(dim=1)

# Define LSTM model
class LSTMModel(torch.nn.Module):
    def __init__(self, input_size, hidden_size, num_classes):
        super(LSTMModel, self).__init__()
        self.hidden_size = hidden_size
        self.lstm = torch.nn.LSTM(input_size, hidden_size, batch_first=True)
        self.fc = torch.nn.Linear(hidden_size, num_classes)

    def forward(self, x):
        # Set initial hidden and cell states
        h0 = torch.zeros(1, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(1, x.size(0), self.hidden_size).to(x.device)

        # Forward propagate LSTM
        out, _ = self.lstm(x, (h0.detach(), c0.detach()))

        # Decode the hidden state of the last time step
        out = self.fc(out[:, -1, :])
        return out


model = torch.load("./model_LSTM.pt")
model.float()
model.eval()


def output_csv_all(data_path, keyMapVal, landmark):

    if keyMapVal is None: return

    #_file = keyMapVal.get('filename', None)
    #if (not _file): return
    _file = keyMapVal

    csv_file = f"{data_path}/{_file}.csv"

    with open(csv_file, 'a', newline="") as _file:
        writer = csv.writer(_file)

        # flattened size: see Landmark.py
        # label class (keyMapVal.index) -> 1
        # Hand: 21 points, each with 3 (x,y,z) coordinates
        # Face: 6 points, each with 2 (x,y) coordinates
        # Left -> 63, Right -> 63, face -> 12
        # Palm -> 1
        # Left Fingers: 5 (thumb + 4 fingers)
        # Right Fingers: 5 (thumb + 4 fingers)
        #
        # label + 2*hands + face + palm + 2*fingers
        # 1 + 2*63 + 12 + 1 + 10 =
        # 1 + 126 + 12 + 1 + 10 = 150
        print(keyMapVal)

        # NB: class index will be mapped and generated at DataLoader.
        # human label is indicated by filename (see KeyClassMapping.py)
        # (label no longer part of internal csv data)
        row = landmark.to_row()
        writer.writerow(row)
    _file.close()


cap = cv2.VideoCapture(0)
print("Webcam Open:", cap.isOpened())

mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles
mp_hands = mp.solutions.hands
mp_face_detection = mp.solutions.face_detection

data_path = "/home/jovyan/train/lstm_data"
landmark = Landmark()
keyClassMapping = KeyClassMapping()
meta = Meta(f"{data_path}/meta.json")
meta.load()

with mp_hands.Hands(
        model_complexity=0,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5) as hands,\
        mp_face_detection.FaceDetection(
            model_selection=0, min_detection_confidence=0.5) as face_detection:

    MAXCOUNT = 30
    count = 0
    inputs = deque(np.zeros((MAXCOUNT, 150)), MAXCOUNT)
    numInput = 0
    filePrefix = None
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

        #
        # DRAW
        #
        if resultsHands.multi_hand_landmarks:

            for hand_landmarks in resultsHands.multi_hand_landmarks:

                mp_drawing.draw_landmarks(
                    image, hand_landmarks, mp_hands.HAND_CONNECTIONS,
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

            #
        # Draw the hand annotations on the image.
        # assume multiple hands per frame is possible
        #
        # print("---------------------------")

        # Handedness
        # assumes selfie mode
        landmark.setWidth(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        landmark.setHeight(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        # set and re-orient coords around relative base point
        landmark.setBasePoints(resultsFace.detections,
                               mp_face_detection.FaceKeyPoint.NOSE_TIP)

        #if resultsHands.multi_hand_landmarks:
        #    print("OFFER TOGGLE:", keyClassMapping.offer_toggle)

        landmark.setHandLandmarks(resultsHands)

        landmark.setPalmOrientation(resultsHands)

        landmark.setFingersOpen(resultsHands)

        landmark.setFaceDetections(resultsFace.detections)

        # Gesture -> Class
        # garbage           → 0
        # qty +3, price +5  → 1
        # qty -7, price -3  → 2
        # qty 2             → 3
        # qty 20            → 4
        # price 1           → 5
        # price 4           → 6

        # to model
        input = landmark.to_row()
        inputs.append(input)

        landmarks = torch.tensor(np.array(inputs)).float().unsqueeze(0)

        out = model(landmarks)

        prob = softmax(out.data)     #setup for threshold or 'garbage' class
        _, klass = torch.max(out.data, 1)
        print("KLASS", prob[0][klass].item(), klass)

        # if (prob[0][klass].item() <= .999 or klass.item() == 0):
        #     print("Garbage", prob[0][klass].item(), klass)
        # else:
        #     print("KLASS", prob[0][klass].item(), klass)
        # output_csv_all(data_path, filePrefix, landmark)

        # noticeable "delay", e.g. gesture classification "residual" as input
        # window maintains gesture history and then over time becomes less relevant
        # until "garbage"

        if cv2.waitKey(5) & 0xFF == 27:
            break

cap.release()
