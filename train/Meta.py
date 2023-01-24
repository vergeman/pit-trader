import json

class Meta():

  '''takes KeyClassMapping and builds a filename.csv -> meta mapping. Reads and
  exports to file provides meta info about training classes for eventual
  downstream use in web

  alongside /data, and /model - this generates a meta.json that carries
  metadata alongside class labels

  '''

  def __init__(self, filename = "meta.json"):
    self.filename = filename
    self.file_meta_map = {}
    self.index_meta_map = {}

  def load(self):
    try:
      with open(self.filename, "r") as _file:
        self.file_meta_map = json.load(_file)
      _file.close()
    except:
      print("file does not exist, creating new map:", self.filename)
      self.file_meta_map = {}


  def update(self, key, val):
    if not key or not val:
      return

    # if meta info exists, let it be
    if self.file_meta_map.get(key):
      return

    self.file_meta_map[key] = val

    # write out any update
    self.save(filename = self.filename, obj = self.file_meta_map)


  def update_index(self, filename, index):
    '''Called by pytorch Dataset class (LandmarkDataset.py) to export model aligned
    index alongside metadata for downstream use
    '''

    if filename is not None and index is not None:
      _m = self.file_meta_map.get(filename)
      if _m:
        _m['index'] = index


  def build_index_meta_map(self):
    for _, meta in self.file_meta_map.items():
      self.index_meta_map[ meta.get('index') ] = meta


  def save(self, filename = None, obj = None):
    f = filename or self.filename
    try:
      with open(f, "w") as _file:
        json.dump(obj, _file, sort_keys=True)
      _file.close()
    except:
      print("There was an error writing meta file", f)


if __name__ == "__main__":
  meta = Meta('test.json')
  meta.load()
  meta.update("file123.csv", {"test":123, "hello": "iamstring"})
