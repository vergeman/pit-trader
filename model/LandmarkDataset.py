import os
import torch
import pandas as pd
from torch.utils.data import Dataset, DataLoader
from torchvision.transforms import Lambda, Compose


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

    dataloader = DataLoader(dataset, batch_size=4, shuffle=True)

    label_batch, train_batch = next( iter(dataloader) )
    # for batch_idx, sample in enumerate(dataloader):
    #    print(batch_idx, sample[0])
