#
# For training we build list of mappings based on the keyboard sequence numbers
# 1-9, 0, and the set of letters immediately below. (qwerty..) from the view point of a keyboard.
#
# This is to streamline gesture labeling by forming the gesture with one hand,
# while pressing the respective key with the other, to assign the label to
# gesture's data in real-time.
#
#
# Price is held out in front of body
# Qty is expressed around the chin (single digit) or forehead (tens)
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
  # make sure to change resultant OFFER_ONES, PRICE_OFFER_TENS
  # elements to represent appropriate keypress.
  OFFER_TOGGLE = "SHIFT"

  #
  # PRICE
  #

  # bids [1..9, 0]
  PRICE_BID_ONES = list(range(1, 10)) + [0]

  # offers [1..9, 0] -
  PRICE_OFFER_ONES = ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")"]

  #
  # QUANTITY
  #

  QTY_BID_ONES = ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"]
  QTY_OFFER_ONES = [i.upper() for i in QTY_BID_ONES[:9] ] + [":"]
  QTY_BID_TENS = ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"]
  QTY_OFFER_TENS = [i.upper() for i in QTY_BID_ONES[:7] ] + ["<", ">", "?"]

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
    self.buildPrice()
    self.buildQty()
    self.buildMisc()


  #
  # PRICE
  # only single digits
  # 1 to 0 keyboard rows
  def buildPrice(self):
    # price bid ones
    for keyPress in self.PRICE_BID_ONES:
      value = keyPress
      self._generateMapping(self.mapping, str(keyPress), str(keyPress), self.index, f"{value} bid")
      self.index = self.index+1

    # price offer ones
    for i, keyPress in enumerate(self.PRICE_OFFER_ONES, 1):
      value = i % 10 # wrap to 0
      self._generateMapping(self.mapping, f"{self.OFFER_TOGGLE}_{value}", keyPress, self.index, f"offer {value}")
      self.index = self.index+1


  #
  # QTY
  # 'a' and 'z' keyboard rows
  def buildQty(self):

    # qty buy ones
    for i, keyPress in enumerate(self.QTY_BID_ONES, 1):
      value = i % 10
      self._generateMapping(self.mapping, str(keyPress), str(keyPress),
                            self.index, f"for {value}")
      self.index = self.index+1

    # qty sell ones
    for i, keyPress in enumerate(self.QTY_BID_ONES, 1):
      value = i % 10
      self._generateMapping(self.mapping, f"{self.OFFER_TOGGLE}_{keyPress}", self.QTY_OFFER_ONES[i % 10],
                            self.index, f"{value} at")
      self.index = self.index+1

    # qty bid tens
    for i, keyPress in enumerate(self.QTY_BID_TENS, 1):
      value = i * 10
      self._generateMapping(self.mapping, keyPress, keyPress, self.index, f"for {value}")
      self.index = self.index+1

    # qty offer tens
    for i, keyPress in enumerate(self.QTY_BID_TENS, 1):
      value = i * 10
      self._generateMapping(self.mapping, f"{self.OFFER_TOGGLE}_{keyPress}", self.QTY_OFFER_TENS[i % 10],
                            self.index, f"{value} at")
      self.index = self.index+1

  #
  # MISC
  #
  def buildMisc(self):
    # spacebar
    self._generateMapping(self.mapping, " ", " ", self.index, "execute market")
    self._generateMapping(self.mapping, f"{self.OFFER_TOGGLE}_ ", " ", self.index, "execute market")
    self.index += 1


if __name__ == "__main__":
  keyClassMapping = KeyClassMapping()
  print(keyClassMapping.index)
  print(keyClassMapping.mapping)
