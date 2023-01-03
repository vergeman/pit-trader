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
class KeyClassMapping():

  # OFFER_TOGGLE
  # make sure to change resultant OFFER_ONES, OFFER_TENS
  # elements to represent appropriate keypress.
  OFFER_TOGGLE = "SHIFT"

  # bids [0..9]
  BID_ONES = list(range(0, 10))

  # offers [0..9] - note the keyboard ordering corresponds to 0 first
  OFFER_ONES = [")", "!", "@", "#", "$", "%", "^", "&", "*", "("]

  # bids [10, 20...100]
  BID_TENS = [ 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p' ]

  # offers [10, 20...100]
  OFFER_TENS = [t.upper() for t in BID_TENS]


  def __init__(self, OFFER_TOGGLE = "SHIFT"):
    self.OFFER_TOGGLE = OFFER_TOGGLE

    self.mapping = {};
    self.index = 0;
    self.build();


  def _generateMapping(self, mapping, key, keypress, index, description):

    mapping[key] = {
      "keypress": keypress,
      "index": index,
      "description": description
    }


  def build(self):

    # bid ones
    for keyPress in self.BID_ONES:
      value = keyPress
      self._generateMapping(self.mapping, str(keyPress), str(keyPress), self.index, f"{value} bid")
      self.index = self.index+1

    # offer ones
    for i, keyPress in enumerate(self.OFFER_ONES):
      value = i
      self._generateMapping(self.mapping, f"{self.OFFER_TOGGLE}_{i}", keyPress, self.index, f"offer {value}")
      self.index = self.index+1

    # bid tens
    for i, keyPress in enumerate(self.BID_TENS, 1):
      value = i * 10
      self._generateMapping(self.mapping, keyPress, keyPress, self.index, f"{value} bid")
      self.index = self.index+1

    # offer tens
    for i, keyPress in enumerate(self.OFFER_TENS, 1):
      value = i * 10
      self._generateMapping(self.mapping, f"{self.OFFER_TOGGLE}_{keyPress.lower()}", keyPress, self.index, f"offer {value}")
      self.index = self.index+1

    # Misc
    self._generateMapping(self.mapping, "m", "m", self.index, "execute market")
    self._generateMapping(self.mapping, f"{self.OFFER_TOGGLE}_m", "M", self.index, "execute market")
    self.index += 1


if __name__ == "__main__":
  keyClassMapping = KeyClassMapping()
  print(keyClassMapping.index)
  print(keyClassMapping.mapping)
