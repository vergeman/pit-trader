#
# For training we build list of mappings based on the keyboard sequence numbers
# 1-9, 0, and the set of letters immediately below. (qwerty..) from the view point of a keyboard.
#
# This is to streamline gesture labeling by forming the gesture with one hand,
# while pressing the respective key with the other, to assign the label to
# gesture's data in real-time.
#
#
# The SHIFT key is toggled to denote an offer (selling.)
#
# This SHIFT 'toggle' nonsense is a result of being unable to capture combined
# characters via openCV's "waitKey()" function (bits aren't returned), e.g
# (Shift + 1, Cntrl + 2). This is OS / UI specific, so for compatibility and
# ease just treat SHIFT as a key to be toggled on/off while gesture labeling.
#
#
# mapping obj:
# key : stringified combination of key input
#   SHIFT: denotes 'SHIFT' key is toggled alongside input key
# keypress: resulting keypress (if we didn't have to toggle)
# index : classifier label associated with input data
# description: description of gesture
#

#
# KEYS
#

# Shift key
SHIFT = "SHIFT"

# bids [0..9]
ONES = list(range(0, 10))

# offers [0..9] - note the keyboard ordering corresponds to 0 first
SHIFT_ONES = [")", "!", "@", "#", "$", "%", "^", "&", "*", "("]

# bids [10, 20...100]
TENS = [ 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p' ]

# offers [10, 20...100]
SHIFT_TENS = [t.upper() for t in TENS]

def _generateMapping(mapping, key, keypress, index, description):

  mapping[key] = {
    "keypress": keypress,
    "index": index,
    "description": description
  }

def build():

  index=0
  mapping = {}

  # bid ones
  for key in ONES:
    value = key
    _generateMapping(mapping, str(key), str(key), index, f"{value} bid")
    index = index+1

  # offer ones
  for i, key in enumerate(SHIFT_ONES):
    value = i
    _generateMapping(mapping, f"{SHIFT}_{i}", key, index, f"offer {value}")
    index = index+1

  # bid tens
  for i, key in enumerate(TENS, 1):
    value = i * 10
    _generateMapping(mapping, key, key, index, f"{value} bid")
    index = index+1

  # offer tens
  for i, key in enumerate(SHIFT_TENS, 1):
    value = i * 10
    _generateMapping(mapping, f"{SHIFT}_{key.lower()}", key, index, f"offer {value}")
    index = index+1

  # Misc
  _generateMapping(mapping, "m", "m", index, "execute market")
  _generateMapping(mapping, "SHIFT_m", "M", index, "execute market")
  index += 1

  return mapping, index

if __name__ == "__main__":
  mapping, num_classes = build()
  print(num_classes)
  print(mapping)
