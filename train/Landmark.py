# we set individual flat data
# then build concatenates those
# we can test what seems to be better for a classifier
# e.g. each type of data -- doesn't it all get ocncatenated anyway?
from types import NoneType
import numpy as np
import mediapipe as mp
import math
mp_face_detection = mp.solutions.face_detection
HandLandmark = mp.solutions.holistic.HandLandmark


class Landmark:

    def __init__(self):
        self.left_hand_landmarks = []
        self.right_hand_landmarks = []
        self.face_landmarks = []
        self.left_palm_orientation = []
        self.right_palm_orientation = []
        self.left_fingers_opens = []
        self.right_fingers_opens = []

        # relative points
        self.base_x = 0
        self.base_y = 0

        # default opencv width height
        self.width = 640
        self.height = 480
        print("__INIT__")

    def setWidth(self, width):
        self.width = width

    def setHeight(self, height):
        self.height = height

    # set relative base coordinates
    def setBasePoints(self, detections, baseKeyPoint, relativize=True):

        if detections is None or baseKeyPoint is None:
            return

        for detection in detections:
            base = mp_face_detection.get_key_point(detection, baseKeyPoint)
            self.base_x = base.x if relativize else 0
            self.base_y = base.y if relativize else 0

    def setHandLandmarks(self, resultsHands):

        # 2 hands,
        # 21 landmarks, 3 points (x,y,z) -> 63 flattened digits per hand
        # 2 * 63 -> 126 total (L, R)
        self.left_hand_landmarks = [-1] * 21 * 3
        self.right_hand_landmarks = [-1] * 21 * 3

        if resultsHands.multi_hand_landmarks is None:
            return

        for i, hand_landmarks in enumerate(resultsHands.multi_hand_landmarks):

            #yes if classifier labels as two left's will overwrite
            handedness = resultsHands.multi_handedness[i].classification[
                0].label  #Left, Right

            _hand_landmarks = self.left_hand_landmarks if handedness == "Left" else \
                self.right_hand_landmarks

            for j, landmark in enumerate(hand_landmarks.landmark):
                k = 3 * j
                _hand_landmarks[k] = landmark.x - self.base_x
                _hand_landmarks[k + 1] = landmark.y - self.base_y
                _hand_landmarks[k + 2] = landmark.z

    def get_tuple(self, arr, index):
        return (arr[index].x, arr[index].y, arr[index].z)

    def setPalmOrientation(self, resultsHands):

        self.left_palm_orientation = [-1]
        self.right_palm_orientation = [-1]

        if resultsHands.multi_hand_landmarks is None:
            return

        for i, hand_landmarks in enumerate(resultsHands.multi_hand_landmarks):

            pt0 = self.get_tuple(hand_landmarks.landmark, 0)
            pt5 = self.get_tuple(hand_landmarks.landmark, 5)
            pt17 = self.get_tuple(hand_landmarks.landmark, 17)
            u = np.subtract(pt17, pt0)
            v = np.subtract(pt17, pt5)
            direction = np.cross(u, v)
            direction /= np.linalg.norm(direction)

            #z-value invert for left hand
            handedness = resultsHands.multi_handedness[i].classification[
                0].label  #Left, Right
            palm_orientation = self.left_palm_orientation if handedness == "Left" else self.right_palm_orientation
            c = -1 if handedness == "Left" else 1
            palm_orientation[0] = int(c * direction[-1] > 0)
            print("PALM FACING" if c * direction[-1] > 0 else "PALM BEHIND")

    def setFingersOpen(self, resultsHands):

        self.left_fingers_opens = [-1] * 5
        self.right_fingers_opens = [-1] * 5

        if resultsHands.multi_hand_landmarks is None:
            return

        for i, hand_landmarks in enumerate(resultsHands.multi_hand_landmarks):

            handedness = resultsHands.multi_handedness[i].classification[
                0].label  #Left, Right
            fingers_opens = self.left_fingers_opens if handedness == "Left" else self.right_fingers_opens

            # THUMB
            # why cross product intuition
            # https://upload.wikimedia.org/wikipedia/commons/a/aa/Cross_product_animation.gif
            #
            # when thumb is open vs thumb closed, the relative placement of
            # vector: point 4, point 3 at each state is akin to red being on
            # either side of the blue (closed is to "left", open to the "right" of
            # the other vector.)
            #
            # Shown in animation resulting cross product z-value (green vector)
            # toggle from negative to positive (open to closed)
            #
            # NB: also have to accommodate buy/sell and left/right reversals as
            # well (hence the 'c')
            p1 = self.get_tuple(hand_landmarks.landmark,
                                HandLandmark.THUMB_CMC)
            p3 = self.get_tuple(hand_landmarks.landmark, HandLandmark.THUMB_IP)
            p4 = self.get_tuple(hand_landmarks.landmark,
                                HandLandmark.THUMB_TIP)
            u = np.subtract(p4, p1)
            v = np.subtract(p4, p3)

            direction = np.cross(u, v)
            direction /= np.linalg.norm(direction)

            c = -1 if handedness == "Left" else 1
            palm_orientation = self.left_palm_orientation if handedness == "Left" else self.right_palm_orientation
            c = c if palm_orientation[0] > 0 else -c

            fingers_opens[0] = int(c * direction[-1] < 0)
            #print("T UV", u, v, np.subtract(u, v))
            print("T", "OPEN" if c * direction[-1] < 0 else "CLOSED",
                  c * direction[-1])

            # FINGERS
            FINGER_ANGLE = 15
            FINGER_RADIANS = FINGER_ANGLE * math.pi / 180

            for finger in range(0, 4):
                pt1 = self.get_tuple(
                    hand_landmarks.landmark,
                    HandLandmark.INDEX_FINGER_MCP + (finger * 4))
                pt3 = self.get_tuple(
                    hand_landmarks.landmark,
                    HandLandmark.INDEX_FINGER_DIP + (finger * 4))
                pt4 = self.get_tuple(
                    hand_landmarks.landmark,
                    HandLandmark.INDEX_FINGER_TIP + (finger * 4))

                u = np.subtract(pt4, pt1)
                v = np.subtract(pt4, pt3)
                uv = np.dot(u, v) / np.linalg.norm(u) / np.linalg.norm(v)
                radians = np.arccos(np.clip(uv, -1, 1))

                print(finger, "OPEN" if radians < FINGER_RADIANS else "CLOSED",
                      radians)
                fingers_opens[finger + 1] = int(radians < FINGER_RADIANS)

    def setFaceDetections(self, detections):

        if detections is None:
            return

        #6 (x,y) keypoints = 12 points
        self.face_landmarks = [-1] * 6 * 2

        #
        # TODO: assume single face for now
        # could use holistic model for singular attached face + hands
        # e.g. issue if player 2 w/ player 1 hands
        # but overkill with number of face points in mesh
        #
        for detection in detections:

            #output_csv_face(key, detection.location_data)
            #also detection.location_data.format,
            #detection.location_data.relative_bounding_box
            #print(self.base_x, self.base_y, detection.location_data)
            for i, point in enumerate(
                    detection.location_data.relative_keypoints):
                j = i * 2
                self.face_landmarks[j] = point.x - self.base_x
                self.face_landmarks[j + 1] = point.y - self.base_y

        #print(self.face_landmarks)

    def to_row(self):
        # combined data
        print("L", self.left_fingers_opens)
        print("R", self.right_fingers_opens)
        val = self.left_hand_landmarks + \
            self.right_hand_landmarks + \
            self.face_landmarks + \
            self.left_palm_orientation + \
            self.right_palm_orientation + \
            self.left_fingers_opens + \
            self.right_fingers_opens

        #print("Landmark", val)
        print("Base", self.base_x, self.base_y)
        print("Face", self.face_landmarks)
        print("L", self.left_hand_landmarks)
        print("R", self.right_hand_landmarks)
        print("L Palm", self.left_palm_orientation)  #1
        print("R Palm", self.right_palm_orientation)  #1
        print("L Open", self.left_fingers_opens)  #5
        print("R Open", self.right_fingers_opens)  #5
        return val


if __name__ == "__main__":
    l = Landmark()
    print("MAIN")
