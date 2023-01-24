import json

class Meta():

  '''takes KeyClassMapping and builds a filename.csv -> meta mapping. Reads and
  exports to file provides meta info about training classes for eventual
  downstream use in web
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
    self.save()


  def update_index(self, filename, index):
    '''Called by pytorch Dataset class (LandmarkDataset.py) to export model aligned
    index alongside metadata for downstream use
    '''

    if filename is not None and index is not None:
      _m = self.file_meta_map.get(filename)
      if _m:
        _m['index'] = index


  def save(self, filename = None):
    f = filename or self.filename
    try:
      with open(f, "w") as _file:
        json.dump(self.file_meta_map, _file, sort_keys=True)
      _file.close()
    except:
      print("There was an error writing meta file", f)


if __name__ == "__main__":
  meta = Meta('test.json')
  meta.load()
  meta.update("file123.csv", {"test":123, "hello": "iamstring"})
