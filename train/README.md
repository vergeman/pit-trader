
## Train

`webcam_trainer.py` writes `.csv` training output to `/data`.

Enables webcam stream with [MediaPipe
library](https://google.github.io/mediapipe/solutions/solutions.html). Keypress
captures labeled gesture data.

### Quickstart Run

```
xhost +local      # enables webcam operation via docker

./docker_run.sh

# in docker env
python train/webcam_trainer.py

```

#### KeyPress

Keyboard rows indicate price or qty sequence from 1, 2, 3 . . . 0.

_ALT_ toggles numbers as an offer. There are also a handful of standalone
actions.

* `KeyClassMapping.py` contains implementation.

  * PRICE_BIDS ONES:  [1..9, 0] -> 1 ,2, 3 . .  . 0
  * PRICE_OFFER ONES: ALT (toggle), then [1..9, 0] -> -1, -2, -3 . . . -0
  * QTY BID ONES:   [a,s,d,f..., ;] -> 1, 2 ,3, 4 . . . 9
  * QTY OFFER ONES: ALT + [a,s,d,f..., ;] -> -1, -2, -3, -4. . . -9
  * QTY BID TENS:   [z,x,c..../] -> 10, 20, 30 . . . 100
  * QTY OFFER TENS: ALT + [z,x,c.../] -> -10, -20, -30 . . . -100
  * PRICE MARKET: " " (spacebar)
  * ACTION CANCEL: "-"
  * GARBAGE: "`"
  * "ALT" toggles Offer.

For example, to train the gesture "offer quantity 50":

  * Press "ALT", to toggle subsequent keypresses as an offer
  * Form the gesture in the webcam
  * Press "b" repeatedly (or hold down) to write the gesture's landmark points
    to file (in this case, `QTY_OFFER_50.csv`)


`/data` contains the output `.csv`, where each file corresponds to a class, each
row in a file a snapshot of the gesture.


### Data Format

`Landmark.py` contains implementation details for the data:

* 150 total points per gesture "snapshot"
* dims are (x,y,z) -> 3, or (x,y) -> 2
* Each value is the landmark coordinate output from Mediapipe
  * except for left and right palm which is [calculated 1 / 0](./Landmark.py)
    (Palm facing, palm behind)
* For no data (e.g. no hands in screen), values default to -1.


| landmarks                |   size * dims      |
| -----                    |   -----            |
| left_hand                | 21 * 3 = 63        |
| right_hand               | 21 * 3 = 63        |
| face                     |  6 * 2 = 12        |
| left_palm                |      1 =  1        |
| right_palm               |      1 =  1        |
| left_fingers             |      5 = 5         |
| right_fingers            |      5 = 5         |


##### Meta.py

Builds and exports `meta.json`; class meta (labels, description) to accompany
training data, ensures index is consistent and sequential throughout training
pipeline

Append additional training data to gestures that might be "confused", typically
the result of a few "lazy" gestures.

Check model confusion matrix to get an idea of difficult gestures; e.g. QTY 80,
90 are hard finger positions for MediaPipe to consistently recognize (can
generate phantom fingers)


##### Experiments

Currently single gestures are recognized, (e.g. a quantity, or a price.). These
are combined to form an order.

A rudimentary LSTM approach (`webcam_trainer_lstm.py`) is included to attempt
combined gestures in a single window of training data; meaning two gestures per
window of n-frames. Several issues make an LSTM less attractive in practice:

* Compound gestures drastically increases class sizes. Each class would be a
  compound gesture, So ~40 classes would become 2*(100)*10 -> 2000+. It would
  take significantly longer to hand build this dataset.

* There is a recognition delay as the window recognizes the gesture. This is
  noticeable during live inference; an initial delay before recognition, and
  then a "hangover", where the recognition persists until the bulk of the data
  is leaves the window and is recognized as a Garbage class.

* Live inference in a game requires feedback to the player. Waiting a longer
  duration to recognize a longer, compound gesture disrupts gameplay. It is a
  better experience to avoid compound gestures, and provide immediate feedback
  for each component gesture. (qty -> display recognition, price -> display
  recognition.)

The classifiers (`webcam_classifier_lstm.py`, `webcam_classifier_scikit.py`)
extend the training code to test live inference. They load pytorch exported
models (see notebooks in `/model`), and are experiments to verify data
compatibility and gauge anecdotal performance (e.g. LSTM difficulties above)

### Files

* `./webcam_trainer.py`: webcam data collection to build training data, exports
  csv's in /data.
* `/data`: houses labeled training data.
* `/experiments`: scratch pad for other models
* `/lstm_data`: small subset of data to test LSTM compound classifcation.


#### Shared with models

* .`/Landmark.py`: class to preprocess and combine MediaPipe inputs (see
  `to_row()` method)
* `./KeyClassMapping.py`: builds keypress - data - description - label object to
  accompany training data.
* `./Meta.py`: writes meta.json mapping (built above)
