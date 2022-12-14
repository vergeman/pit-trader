import os
import torch
import pandas as pd
import numpy as np
from torch.utils.data import Dataset, DataLoader
from torchvision.transforms import Lambda, Compose
from torch.utils.data.sampler import SubsetRandomSampler

class LandmarkDataset(Dataset):
    """PyTorch Custom Dataset and Dataloader reference:
    https://pytorch.org/tutorials/beginner/basics/data_tutorial.html#creating-a-custom-dataset-for-your-files
    https://pytorch.org/tutorials/recipes/recipes/custom_dataset_transforms_loader.html

    transform: functions on data
    target_transform: transform on label
    """

    def __init__(self, csv_file, transform = None, target_transform = None):
        self.landmark_frames = pd.read_csv(csv_file, header=None)
        self.transform = transform
        self.target_transform = target_transform


    def __len__(self):
        return len(self.landmark_frames)


    def __getitem__(self, idx):

        if torch.is_tensor(idx):
            idx = idx.tolist()

        label = self.landmark_frames.iloc[idx, 0]
        landmarks = self.landmark_frames.iloc[idx, 1:]

        if self.transform:
            landmarks = self.transform(landmarks)
        if self.target_transform:
            label = self.target_transform(label)

        return label, landmarks

#
# python -i LandmarkDataset.py
#
if __name__ == "__main__":

    transformations = Compose([
        Lambda(lambda x: torch.tensor(x.values))
    ])

    dataset = LandmarkDataset("/home/jovyan/train/data/landmarks.csv",
                              transform=transformations)

    # Splitting
    # https://stackoverflow.com/questions/50544730/how-do-i-split-a-custom-dataset-into-training-and-test-datasets/50544887#50544887
    # https://pytorch.org/docs/stable/data.html#torch.utils.data.Sampler
    # NB: subset is taken within indices
    # TODO: not only need to randomize 'indices', but also fair split across classes
    # might be easier to filter csv to train.csv, valid.csv
    #

    split_p = .2
    split = int( np.floor( .2 * len(dataset) ) )
    indices = list( range(len(dataset)) )
    train_indices, val_indices = indices[split:], indices[:split]

    train_sampler = SubsetRandomSampler(train_indices)
    valid_sampler = SubsetRandomSampler(val_indices)

    train_dataloader = DataLoader(dataset, batch_size=4, sampler=train_sampler)
    valid_dataloader = DataLoader(dataset, batch_size=4, sampler=valid_sampler)

    # label_batch, train_batch = next( iter(train_dataloader) )

    def print_dataloader(dataloader):
        for batch_idx, sample in enumerate(dataloader):
            print(batch_idx, sample[0])

    print("TRAIN")
    print_dataloader(train_dataloader)

    print("VALID")
    print_dataloader(valid_dataloader)
