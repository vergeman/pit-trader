# we set individual flat data
# then build concatenates those
# we can test what seems to be better for a classifier
# e.g. each type of data -- doesn't it all get ocncatenated anyway?
import mediapipe as mp
mp_hands = mp.solutions.hands
import copy

class Landmark:

    def __init__(self):
        #
        # these landmarks are all normalized, relative to camera dimensions
        #
        # "each landmark is composed of x, y and z. x and y are
        # normalized to [0.0, 1.0] by the image width and height respectively."
        # https://google.github.io/mediapipe/solutions/hands.html
        #

        self.handedness = []
        self.hand_landmarks = [ [], [] ]
        self.face_landmarks = []

        self.relative_hand_landmarks = [ [], [] ]
        self.relative_face_landmarks = []

        # default opencv width height
        self.width = 640
        self.height= 480
        print("__INIT__")

    def setWidth(self, width):
        self.width = width

    def setHeight(self, height):
        self.height = height

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
        # assume 2 hands
        # 21 landmarks, each landmark 3 points (x,y,z) -> 63 flat points
        #[ [x0 ,y0, z0, x1, y1, z1, ...], [..] ]
        MAX_HANDS = 2
        self.hand_landmarks = MAX_HANDS * [  [-1] * 21 * 3 ]
        self.relative_hand_landmarks = copy.deepcopy(self.hand_landmarks)

        if multi_hand_landmarks is None:
            return

        #output_csv_hand_landmarks(key, hand_landmarks)
        #foreach hand i
        for i, hand_landmarks in enumerate(multi_hand_landmarks):

            if (i >= MAX_HANDS): return

            # 0th point is the wrist - seems acceptable midpoint?
            # https://mediapipe.dev/images/mobile/hand_landmarks.png
            base_x = hand_landmarks.landmark[0].x
            base_y = hand_landmarks.landmark[0].y
            base_z = hand_landmarks.landmark[0].z

            #foreach point - described with 3 points
            for j, landmark in enumerate(hand_landmarks.landmark):
                k = 3*j
                self.hand_landmarks[i][k] = landmark.x
                self.hand_landmarks[i][k+1] = landmark.y
                self.hand_landmarks[i][k+2] = landmark.z
                if (j == 0):
                    print("WRIST", self.hand_landmarks[i][k],
                          self.hand_landmarks[i][k+1],
                          self.hand_landmarks[i][k+2])


                # ok so should be able to subtract normalized values and then scale 
                #self.relative_hand_landmarks[i][k] = landmark.x * self.width - base_x * self.width
                #self.relative_hand_landmarks[i][k+1] = landmark.y * self.height - base_y * self.height
                #self.relative_hand_landmarks[i][k+2] = landmark.z - base_z

            print(
                f'WRIST coordinates: (',
                f'{mp_hands.HandLandmark.WRIST},',
                f'{hand_landmarks.landmark[mp_hands.HandLandmark.WRIST].x * self.width}, '
                f'{hand_landmarks.landmark[mp_hands.HandLandmark.WRIST].y * self.height},'
                f'{hand_landmarks.landmark[mp_hands.HandLandmark.WRIST].z})'
            )

            print("H", self.hand_landmarks[i])
            print("R", self.relative_hand_landmarks[i])
            
            print('------------------')

        
    def setFaceDetections(self, detections):
        #6 (x,y) keypoints = 12 points
        self.face_landmarks = [-1] * 6 * 2
        self.relative_face_landmarks = copy.deepcopy(self.face_landmarks)

        if detections is None:
            return

        #foreach face - assume single face for now
        #TODO: logic to select nearest face
        #
        #6 key points:
        #right eye, left eye, nose tip, mouth center,
        #right ear tragion, and left ear tragion

        for detection in detections:
            #output_csv_face(key, detection.location_data)
            #also detection.location_data.format,
            #detection.location_data.relative_bounding_box
            #
            # use mouth center as base (index 3)
            #
            base_x = detection.location_data.relative_keypoints[3].x
            base_y = detection.location_data.relative_keypoints[3].y


            for i, point in enumerate(detection.location_data.relative_keypoints):
                j = i*2
                self.face_landmarks[j] = point.x
                self.face_landmarks[j+1] = point.y

                self.relative_face_landmarks[j] = point.x * self.width - base_x
                self.relative_face_landmarks[j+1] = point.y * self.height - base_y

        #print("F", self.face_landmarks)
        #print("R", self.relative_face_landmarks)


    def to_row(self):
        # combined data
        # consistent left/right hand ordering
        left = 0 if self.handedness[0] == "Left" else 1
        right = 1 if left == 0 else 0

        landmarks = self.hand_landmarks[left] + self.hand_landmarks[right] + \
            self.face_landmarks

        vals = [self.width, self.height] + landmarks

        # denormalize
        denormalized_vals = self._denormalize(landmarks)

        print("Landmark", vals)
        print("Denormalized", denormalized_vals)
        return vals


    def _denormalize(self, landmarks):
        denormalized = []
        for i in range( 0, len( landmarks ), 3):
            denormalized.append( landmarks[i] * self.width )     # x
            denormalized.append( landmarks[i+1] * self.height )  # y
            denormalized.append( landmarks[i+2] )                # z
        return denormalized


    def _relativize(self, landmarks):
        relativized = []
        for i in range( 0, len( landmarks ), 3):
            relativized.append( landmarks[i] * self.width )     # x
            relativized.append( landmarks[i+1] * self.height )  # y
            relativized.append( landmarks[i+2] )                # z



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
