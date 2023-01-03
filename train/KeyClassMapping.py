#
# For training we build list of mappings based on the keyboard sequence numbers
# 1-9, 0, and the set of letters immediately below. (qwerty..) from the view
# point of a keyboard.
#
# This is to streamline gesture labeling by forming the signal with one hand,
# and pressing the designated key with the other in real-time.
#
# GESTURES
# Price is held out in front of body
# Qty is expressed around the chin (single digit) or forehead (tens)
# https://tradepractices.files.wordpress.com/2012/07/commodity-and-futures-handsignals.pdf
#
# LABELING
# The ALT key is toggled to denote an offer (selling.)
#
# This 'toggle' nonsense is a result of being unable to reliably capture
# combination key presses via openCV's "waitKey()" function; e.g (ALT+1,
# CNTL+2, SHIFT+a, etc.)
#
# Remedy is to use an on/off toggle while labeling to indicate selling.
#
# NB: SHIFT as a toggle is inconsistent: for numeric digits 0-9, e.g. (!, @,
# 3..) waitkey() does return shifted, 'combined' values. But letters aren't
# "shifted" / capitalized. Go figure. Hence ALT as default.
#
# mapping obj:
# key : stringified combination of key input
#   OFFER_TOGGLE: denotes "sell" key toggle
# keypress: resulting keypress (if we didn't have to toggle)
# index : sequential classifier label associated with input data
# description: description of gesture
#

#
# KEYS
#
class KeyClassMapping():

  #
  # PRICE
  #
  # [1..9, 0]
  PRICE_BID_ONES = list(range(1, 10)) + [0]
  PRICE_OFFER_ONES = list(range(1, 10)) + [0]

  #
  # QUANTITY
  #
  QTY_BID_ONES = ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"]
  QTY_OFFER_ONES = [i.upper() for i in QTY_BID_ONES[:9] ] + [":"]
  QTY_BID_TENS = ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"]
  QTY_OFFER_TENS = [i.upper() for i in QTY_BID_ONES[:7] ] + ["<", ">", "?"]

  def __init__(self, OFFER_TOGGLE_NAME = "ALT", OFFER_TOGGLE_KEYCODE=233):

    # OFFER_TOGGLE
    self.OFFER_TOGGLE_NAME = OFFER_TOGGLE_NAME
    self.OFFER_TOGGLE_KEYCODE = OFFER_TOGGLE_KEYCODE

    self.offer_toggle = False
    self.mapping = {};
    self.index = 0;

    self.build();


  def getKeyVal(self, key):
    if (key == self.OFFER_TOGGLE_KEYCODE):
      self.offer_toggle = not self.offer_toggle
      print("OFFER TOGGLE:", self.offer_toggle)

    # creates combined lookup key for generated mapping
    if (key != -1):
      keyMap = chr(key)
      if self.offer_toggle:
        keyMap = f"{self.OFFER_TOGGLE_NAME}+{chr(key)}"

      keyVal = self.mapping.get( keyMap, None)
      #print("KEYMAP", " ".join([str(key), str(self.offer_toggle), keyMap]), "->", keyVal)
      return keyVal


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
      key = str(keyPress)
      value = keyPress
      self._generateMapping(self.mapping, key, key, self.index, f"{value} bid")
      self.index = self.index+1

    # price offer ones
    for i, keyPress in enumerate(self.PRICE_OFFER_ONES, 1):
      key = f"{self.OFFER_TOGGLE_NAME}+{keyPress}"
      value = i % 10 # wrap to 0
      self._generateMapping(self.mapping, key, key, self.index, f"offer {value}")
      self.index = self.index+1


  #
  # QTY
  # 'a' and 'z' keyboard rows
  def buildQty(self):

    # qty buy ones
    for i, keyPress in enumerate(self.QTY_BID_ONES, 1):
      key = str(keyPress)
      value = i % 10
      self._generateMapping(self.mapping, key, key, self.index, f"for {value}")
      self.index = self.index+1

    # qty sell ones
    for i, keyPress in enumerate(self.QTY_BID_ONES, 1):
      key = f"{self.OFFER_TOGGLE_NAME}+{keyPress}"
      value = i % 10
      self._generateMapping(self.mapping, key, key, self.index, f"{value} at")
      self.index = self.index+1

    # qty bid tens
    for i, keyPress in enumerate(self.QTY_BID_TENS, 1):
      key = keyPress
      value = i * 10
      self._generateMapping(self.mapping, key, key, self.index, f"for {value}")
      self.index = self.index+1

    # qty offer tens
    for i, keyPress in enumerate(self.QTY_BID_TENS, 1):
      key = f"{self.OFFER_TOGGLE_NAME}+{keyPress}"
      value = i * 10
      self._generateMapping(self.mapping, key, key, self.index, f"{value} at")
      self.index = self.index+1

  #
  # MISC
  #
  def buildMisc(self):
    # spacebar
    self._generateMapping(self.mapping, " ", " ", self.index, "execute market")
    self._generateMapping(self.mapping, f"{self.OFFER_TOGGLE_NAME}+ ", f"{self.OFFER_TOGGLE_NAME}+ ",
                          self.index, "execute market")
    self.index += 1

    # out out out
    self._generateMapping(self.mapping, "-", "-", self.index, "cancel")
    self._generateMapping(self.mapping, f"{self.OFFER_TOGGLE_NAME}+-", f"{self.OFFER_TOGGLE_NAME}+-",
                          self.index, "cancel")
    self.index += 1




if __name__ == "__main__":
  keyClassMapping = KeyClassMapping()
  print(keyClassMapping.index)
  print(keyClassMapping.mapping)
