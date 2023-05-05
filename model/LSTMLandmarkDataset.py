import os
import sys
import glob
import torch
import pandas as pd
import numpy as np
import random
from torch.utils.data import Dataset, DataLoader
from torchvision.transforms import Lambda, Compose
from torch.utils.data.sampler import SubsetRandomSampler

sys.path.append('/home/jovyan/train')
#from Meta import Meta

class LSTMLandmarkDataset(Dataset):
    """PyTorch Custom Dataset and Dataloader reference:
    https://pytorch.org/tutorials/beginner/basics/data_tutorial.html#creating-a-custom-dataset-for-your-files
    https://pytorch.org/tutorials/recipes/recipes/custom_dataset_transforms_loader.html

    transform: functions on data
    target_transform: transform on label
    """



    def __init__(self, data_dir, model_dir, seq_len, transform = None, target_transform = None):

      self.file_list = []
      self.landmark_frames = pd.DataFrame()
      self.class_map = {}
      self.num_class = 0
      self.seq_len = seq_len

      # concatenate directory, assign class index
      self.file_list = sorted( glob.glob(data_dir + "/*.csv") )
      for class_idx, filename in enumerate(self.file_list):
          class_name = filename.replace('.csv', '').split('/')[-1]
          self.class_map[class_idx] = class_name

          landmark_frame = pd.read_csv(filename, header=None)

          # add class label to dataframe
          landmark_frame.insert(0, "class_idx", class_idx)

          # concatenate dataframes into memory
          self.landmark_frames = pd.concat([self.landmark_frames, landmark_frame])


      self.num_class = len(self.class_map)
      self.num_sequence = len(self.landmark_frames) // self.seq_len

      self.transform = transform
      self.target_transform = target_transform


    def __len__(self):
        return int(len(self.landmark_frames) / self.seq_len)

    def __getitem__(self, idx):
        seq_start_idx = idx * self.seq_len
        seq_end_idx = (idx + 1) * self.seq_len
        sequence = self.landmark_frames[seq_start_idx:seq_end_idx]
        return int(sequence.iloc[0]["class_idx"]), sequence.values[:, 1:]

    # len of landmark points
    def input_size(self):
        r = random.randint(0, int(len(self) / self.seq_len) )
        _, landmarks = self[r]
        return len(landmarks[0])


#
# ~/python -i LandmarkDataset.py
#
if __name__ == "__main__":

    transformations = Compose([
        Lambda(lambda x: torch.tensor(x.values))
    ])

    dataset = LSTMLandmarkDataset("/home/jovyan/train/lstm_data",
                              "/home/jovyan/model",
                              30,
                              transform=transformations)

    # Splitting
    # https://stackoverflow.com/questions/50544730/how-do-i-split-a-custom-dataset-into-training-and-test-datasets/50544887#50544887
    # https://pytorch.org/docs/stable/data.html#torch.utils.data.Sampler
    #
    # Stratified Sample
    # ensure we take split_p of each class (class sizes can vary) vs split_p of entire dataset (unbalanced distribution)
    # filter for each class, collect train/val split, and sample from those respective collections
    #
    # Split your dataset into train and test indices
    num_samples = len(dataset)
    indices = list(range(num_samples))
    split = int(np.floor(0.2 * num_samples)) # 20% test set
    np.random.shuffle(indices)
    train_indices, test_indices = indices[split:], indices[:split]

    # Define samplers for each split
    train_sampler = SubsetRandomSampler(train_indices)
    test_sampler = SubsetRandomSampler(test_indices)

    # Define dataloaders for each split
    batch_size = 1
    train_dataloader = DataLoader(dataset, batch_size=batch_size, sampler=train_sampler)
    valid_dataloader = DataLoader(dataset, batch_size=batch_size, sampler=test_sampler)

    def print_dataloader(dataloader):
       for batch_idx, sample in enumerate(dataloader):
          print(batch_idx, sample[0])

    print("TRAIN")
    print_dataloader(train_dataloader)

    print("VALID")
    print_dataloader(valid_dataloader)
