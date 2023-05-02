FROM jupyter/minimal-notebook:notebook-6.4.12

RUN conda install --yes \
pytorch torchvision torchaudio cudatoolkit=10.2 -c pytorch

RUN conda install --yes -c conda-forge opencv pandas numpy scikit-learn skl2onnx onnx=1.13.1

USER root
# NB: missing binary for cv2 in docker libgl1
RUN apt-get update && apt-get install -y libgl1

USER jovyan

RUN pip install mediapipe
