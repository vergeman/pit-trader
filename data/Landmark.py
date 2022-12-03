# we set individual flat data
# then build concatenates those
# we can test what seems to be better for a classifier
# e.g. each type of data -- doesn't it all get ocncatenated anyway?
import mediapipe as mp
mp_face_detection = mp.solutions.face_detection

class Landmark:

    def __init__(self):
        self.left_hand_landmarks = []
        self.right_hand_landmarks = []
        self.face_landmarks = []

        # relative points
        self.base_x = 0
        self.base_y = 0

        # default opencv width height
        self.width = 640
        self.height= 480
        print("__INIT__")

    def setWidth(self, width):
        self.width = width

    def setHeight(self, height):
        self.height = height


    # set relative base coordinates
    def setBasePoints(self, detections, baseKeyPoint):

        if detections is None or baseKeyPoint is None:
            return

        for detection in detections:
            base = mp_face_detection.get_key_point(detection, baseKeyPoint)
            self.base_x = base.x
            self.base_y = base.y


    def setHandLandmarks(self, resultsHands, relativize = True):

        # 2 hands,
        # 21 landmarks, 3 points (x,y,z) -> 63 flat points
        self.left_hand_landmarks = [-1] * 21 * 3
        self.right_hand_landmarks = [-1] * 21 * 3

        if resultsHands.multi_hand_landmarks is None:
            return

        for i, hand_landmarks in enumerate(resultsHands.multi_hand_landmarks):

            #yes if classifier labels as two left's will overwrite
            handedness = resultsHands.multi_handedness[i].classification[0].label #Left, Right

            _hand_landmarks = self.left_hand_landmarks if handedness == "Left" else \
                self.right_hand_landmarks

            for j, landmark in enumerate(hand_landmarks.landmark):
                k = 3*j
                _hand_landmarks[k] = landmark.x - self.base_x if relativize else 0
                _hand_landmarks[k+1] = landmark.y - self.base_y if relativize else 0
                _hand_landmarks[k+2] = landmark.z

        #print(self.hand_landmarks)

    def setFaceDetections(self, detections, relativize = True):

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
            for i, point in enumerate(detection.location_data.relative_keypoints):
                j = i*2
                self.face_landmarks[j] = point.x - self.base_x if relativize else 0
                self.face_landmarks[j+1] = point.y - self.base_y if relativize else 0

        #print(self.face_landmarks)

    def setRelative(self, point):
        left, right, face - base.x, base.y
        pass

    def to_row(self):
        # combined data

        val = [self.width, self.height] + \
            self.left_hand_landmarks + self.right_hand_landmarks + \
            self.face_landmarks

        #print("Landmark", val)
        print("L", self.left_hand_landmarks)
        print("R", self.right_hand_landmarks)
        return val


if __name__ == "__main__":
    l = Landmark()
    print("MAIN")
