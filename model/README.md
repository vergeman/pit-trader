# Models

## Quickstart

Models are set to operate within docker environment using a running Jupyter
server.

NB: Jupyter server will start, but logs may be displaced by the connected front
end node game. Query the container logs separately to get the jupyter URL with
access token.


```
docker-compose up

# access browser accessible notebook url:
docker logs pit-trader_pytorch-minimal-notebook_1


```

Jupyter URL should approximate: http://127.0.0.1:8888/lab?token={token}

## Contents

Gestures (Quantity, Price, Cancel, "Market") are from a [CME
appendix](../web/public/commodity-and-futures-handsignals.pdf)

### Notebooks

Three notebooks with respective classifiers:

* `classifier.ipynb`: vanilla 2 layer NN, takes gesture snapshot
* `LSTM.ipynb`: 1 layer LSTM, 1 layer NN; data is assumed to be a sequence of 30.
* `scikit_models.ipynb`: Logistic and SVC (Support Vector Classifier)from
  scikit-learn.

### Dataset

Dataset classes: custom Pytorcch Dataset class passed to DataLoader in each
notebook. Reads `.csv` from /train/data.

* `LandmarkDataset.py`: used by `classifier.ipynb`, and `scikit_models.ipynb`
* `LSTMLandmarkDataset.py`: used by `LSTM.ipynb` - groups by seq len.

### Exports

Models are exported via onnx for javascript runtime, and pickled pytorch for
experimental classifiers to `/export`.

Each will be overwritten with last run.

## Models

Explore the individual models in the notebook. The scikit models were used to
provide some baseline comparison, and turns out the Logistic Regression seems to
offer the best "accuracy", training time quick, and file size is much smaller.

There is some clear overfitting in all the models - which isn't necessarily
terrible for this problem domain. Gameplay is better served when gesture
recognition is repeatable, and of high certainty. Frustration often occurs when
aiming to "generalize" gestures and argMaxing across low probability
possibilities - this often leads to waffling recognition that jumps between
noisy gestures, even though the input may be unchanged from a player's
perspective.

Explore the notebooks and outputs (accuracy, confusion matrix.) There's not a
runaway best performer, but for simplicity and gameplay testing Logistic
Regression works reasonably well.


### Future Work

Some other approaches and links worth considering:


* Dynamic Time Warping
  * https://www.sicara.fr/blog-technique/sign-language-recognition-using-mediapipe
  * https://github.com/gabguerin/Sign-Language-Recognition--MediaPipe-DTW/
* [Standardize Video FPS](https://medium.com/@kyip_7564/a-process-to-standardize-video-fps-for-machine-learning-93a936abdbc)
* HMM