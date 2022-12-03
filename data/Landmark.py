# we set individual flat data
# then build concatenates those
# we can test what seems to be better for a classifier
# e.g. each type of data -- doesn't it all get ocncatenated anyway?


class Landmark:

    def __init__(self):
        self.left_hand_landmarks = []
        self.right_hand_landmarks = []
        self.face_landmarks = []

        # default opencv width height
        self.width = 640
        self.height= 480
        print("__INIT__")

    def setWidth(self, width):
        self.width = width

    def setHeight(self, height):
        self.height = height


    def setHandLandmarks(self, resultsHands):

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
                _hand_landmarks[k] = landmark.x
                _hand_landmarks[k+1] = landmark.y
                _hand_landmarks[k+2] = landmark.z

        #print(self.hand_landmarks)



    def setFaceDetections(self, detections):
        #6 (x,y) keypoints = 12 points
        self.face_landmarks = [-1] * 6 * 2

        if detections is None:
            return

        #foreach face - assume single face for now
        #TODO: logic to select nearest face
        for detection in detections:
            #output_csv_face(key, detection.location_data)
            #also detection.location_data.format,
            #detection.location_data.relative_bounding_box
            for i, point in enumerate(detection.location_data.relative_keypoints):
                j = i*2
                self.face_landmarks[j] = point.x
                self.face_landmarks[j+1] = point.y

        #print(self.face_landmarks)


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


#resultsHands.multi_handedness
#NB: this needs to be inverted in selfie mode
#classification {
  # index: 1
  # score: 0.9612538814544678
  # label: "Right"
#}

    # if key != -1:
    #     print("RES", dir(resultsHands))
    #     print("WOLRD", resultsHands.multi_hand_world_landmarks)
    #     print("ML", resultsHands.multi_handedness)
