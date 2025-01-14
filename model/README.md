# Models

## Models Recognition

| Model                                                        | Accuracy |
|--------------------------------------------------------------|----------|
| [Logistic Regression](./scikit_models.ipynb)                 | .984     |
| [2 Layer NN](./classifier.ipynb)                             | .9774    |
| [SVC (Support Vector Classification)](./scikit_models.ipynb) | .955     |
| [LSTM](./LSTM.ipynb)                                         | .8966    |


The scikit models were intended for use as a baseline comparison, but turned out
the scikit Logistic Regression offered the best "accuracy", with especially
quick training time, and small model file size. Details are visible in each
respective notebook's output.

There is over-fitting in all the models (accuracy >= 90% ) - which isn't
necessarily terrible for this problem domain:

Gameplay is better served when gesture recognition is repeatable and exact.
Frustration occurs when gestures are "generalized" and argMaxing across low
probability possibilities: it often leads to waffling recognition that jumps
between noisy gestures, even though the input may be unchanged from a player's
perspective.

For simplicity and gameplay testing Logistic Regression works well.


## Quickstart

Models are set to operate within docker environment using a running Jupyter
server.

Logistic Regression is the current model used by game.

NB: Jupyter server will start, but logs may be displaced by the connected front
end node game. Query the container logs separately to get the jupyter URL with
access token.


```
docker compose up

# access browser accessible notebook url:
docker logs pit-trader_pytorch-minimal-notebook_1
```

Jupyter URL should approximate: http://127.0.0.1:8888/lab?token={token}


## Contents

Gestures (Quantity, Price, Cancel, "Market") are from a [CME
appendix](../web/public/commodity-and-futures-handsignals.pdf)

### Notebooks

Three notebooks with respective classifiers:

* [./classifier.ipynb](`classifier.ipynb`): vanilla 2 layer NN, takes gesture snapshot
* [./LSTM.ipynb](`LSTM.ipynb`): 1 layer LSTM, 1 layer NN; data is assumed to be a sequence of 30.
* [./scikit_models.ipynb](`scikit_models.ipynb`): Logistic and SVC (Support Vector Classifier)from
  scikit-learn.

### Dataset

Dataset classes: custom Pytorch Dataset class passed to DataLoader in each
notebook. Reads `.csv` from /train/data.

* `LandmarkDataset.py`: used by `classifier.ipynb`, and `scikit_models.ipynb`
* `LSTMLandmarkDataset.py`: used by `LSTM.ipynb` - groups by seq len.

### Exports

Models are exported via ONNX for javascript runtime, and pickled pytorch for
experimental classifiers to `/export`.

NB: Models are overwritten with each run.


---

### Future Work

Notes on other approaches; links:

* Dynamic Time Warping
  * https://www.sicara.fr/blog-technique/sign-language-recognition-using-mediapipe
  * https://github.com/gabguerin/Sign-Language-Recognition--MediaPipe-DTW/
* [Standardize Video FPS](https://medium.com/@kyip_7564/a-process-to-standardize-video-fps-for-machine-learning-93a936abdbc)
* HMM