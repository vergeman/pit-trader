# we set individual flat data
# then build concatenates those
# we can test what seems to be better for a classifier
# e.g. each type of data -- doesn't it all get ocncatenated anyway?


class Landmark:

    def __init__(self):
        self.handedness = []
        self.hand_landmarks = [ [], [] ]
        self.relative_keypoints = []
        print("__INIT__")


    def setHandedness(self, multi_handedness):

        self.handedness = [None, None]

        if multi_handedness is None:
            return

        # we assume world of max two hands, take most likely
        # assume hand order corresponds with hand_landmarks order
        for i, hand in enumerate(multi_handedness):
            if i > 1: continue

            #print("HAND", hand)
            self.handedness[i] = hand.classification[0].label

            #for classification in hand.classification:
                #print("C", classification.label, classification.score)
                #set something

        print(self.handedness)
        print("---------------------------")
        pass


    def setHandLandmarks(self, multi_hand_landmarks):
        # 2 hands,
        # 21 landmarks, 3 points (x,y,z) -> 63 flat points
        self.hand_landmarks = [
            [-1] * 21 * 3,
            [-1] * 21 * 3
        ]

        if multi_hand_landmarks is None:
            return

        #output_csv_hand_landmarks(key, hand_landmarks)
        #foreach hand i
        for i, hand_landmarks in enumerate(multi_hand_landmarks):
            #print(hand_landmarks)
            for j, landmark in enumerate(hand_landmarks.landmark):
                k = 3*j
                self.hand_landmarks[i][k] = landmark.x
                self.hand_landmarks[i][k+1] = landmark.y
                self.hand_landmarks[i][k+2] = landmark.z

        #print(self.hand_landmarks)



    def setFaceDetections(self, detections):
        #6 (x,y) keypoints = 12 points
        self.relative_keypoints = [-1] * 6 * 2

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
                self.relative_keypoints[j] = point.x
                self.relative_keypoints[j+1] = point.y

        #print(self.relative_keypoints)


    def to_row(self):
        # combined data
        # consistent left/right hand ordering
        left = 0 if self.handedness[0] == "Left" else 1
        right = 1 if left == 0 else 0

        val = self.hand_landmarks[left] + self.hand_landmarks[right] + \
            self.relative_keypoints

        print("V", val)
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
