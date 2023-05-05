# /Model

Three notebooks with respective classifiers:

* `classifier.ipynb`: vanilla 2 layer NN, takes gesture snapshot
* `LSTM.ipynb`: 1 layer LSTM, 1 layer NN; data is assumed to be a sequence of 30.
* `scikit_models.ipynb`: Logistic and SVC from scikit-learn.

PyTorch Dataset classes:

* LandmarkDataset.py: used by `classifier.ipynb`, and `scikit_models.ipynb`
* LSTMLandmarkDataset: used by `LSTM.ipynb` - groups by seq len.

Models (onnx, picked pytorch) are written to `/export`.
