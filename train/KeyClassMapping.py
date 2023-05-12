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
# index : sequential classifier label associated with input data (deprecated,
#   deferred to DataLoader)
# filename: human class label
# description: description of gesture
#

#
# KEYS
#


class KeyClassMapping():

  #
  # PRICE
  #
  # BIDS ONES:  [1..9, 0] -> 1 ,2, 3 . .  . 0
  # OFFER ONES: ALT (toggle), then [1..9, 0] -> -1, -2, -3 . . . -0
  PRICE_BID_ONES = list(range(1, 10)) + [0]
  PRICE_OFFER_ONES = list(range(1, 10)) + [0]

  #
  # QUANTITY
  #
  # Offers concatenated with OFFER_TOGGLE:
  #
  # QTY BID ONES:   [a,s,d,f..., ;] -> 1, 2 ,3, 4 . . . 9
  # QTY OFFER ONES: ALT + [a,s,d,f..., ;] -> -1, -2, -3, -4. . . -9
  # NB: there is no qty 0
  #
  # QTY BID TENS:   [z,x,c..../] -> 10, 20, 30 . . . 100
  # QTY OFFER TENS: ALT + [z,x,c.../] -> -10, -20, -30 . . . -100
  QTY_BID_ONES = ["a", "s", "d", "f", "g", "h", "j", "k", "l"]
  QTY_BID_TENS = ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"]

  #
  # ACTION
  # works with or without offer toggle enabled (no difference)
  #
  # MARKET:  ' ' (spacebar)
  # CANCEL:  '-' (minus)
  # GARBAGE: '`' (tilde)
  #
  def __init__(self, OFFER_TOGGLE_NAME = "ALT", OFFER_TOGGLE_KEYCODE=233):

    # OFFER_TOGGLE
    self.OFFER_TOGGLE_NAME = OFFER_TOGGLE_NAME
    self.OFFER_TOGGLE_KEYCODE = OFFER_TOGGLE_KEYCODE

    self.offer_toggle = False
    self.mapping = {};

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


  def _generateMapping(self, mapping, key, keypress, gestureType, action, value, description, filename):
    ''' see GestureBuilder.ts for string enums equivalents
    '''

    mapping[key] = {
      "gestureType": gestureType,   # Qty, Price, Action
      "action": action, 	          # None, Buy, Sell, Garbage, Cancel
      "value": value,               # number (qty, price, None)
      "keypress": keypress,
      "description": description,
      "filename": filename
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
    gestureType = "Price"

    # price bid ones
    for keyPress in self.PRICE_BID_ONES:
      key = str(keyPress)
      value = keyPress
      filename = f"PRICE_BID_{value}.csv"
      self._generateMapping(self.mapping, key, key, gestureType, "Buy", value, f"{value} bid", filename)

    # price offer ones
    for i, keyPress in enumerate(self.PRICE_OFFER_ONES, 1):
      key = f"{self.OFFER_TOGGLE_NAME}+{keyPress}"
      value = i % 10 # wrap to 0
      filename = f"PRICE_OFFER_{value}.csv"
      self._generateMapping(self.mapping, key, key, gestureType, "Sell", value, f"offer {value}", filename)


  #
  # QTY
  # 'a' and 'z' keyboard rows
  def buildQty(self):
    gestureType = "Qty"

    # qty buy ones
    for i, keyPress in enumerate(self.QTY_BID_ONES, 1):
      key = str(keyPress)
      value = i % 10
      filename = f"QTY_BID_{value:03d}.csv"
      self._generateMapping(self.mapping, key, key, gestureType, "Buy", value, f"for {value}", filename)

    # qty sell ones
    for i, keyPress in enumerate(self.QTY_BID_ONES, 1):
      key = f"{self.OFFER_TOGGLE_NAME}+{keyPress}"
      value = -(i % 10)
      filename = f"QTY_OFFER_{-value:03d}.csv"
      self._generateMapping(self.mapping, key, key, gestureType, "Sell", value, f"{value} at", filename)

    # qty bid tens
    for i, keyPress in enumerate(self.QTY_BID_TENS, 1):
      key = keyPress
      value = i * 10
      filename = f"QTY_BID_{value:03d}.csv"
      self._generateMapping(self.mapping, key, key, gestureType, "Buy", value, f"for {value}", filename)

    # qty offer tens
    for i, keyPress in enumerate(self.QTY_BID_TENS, 1):
      key = f"{self.OFFER_TOGGLE_NAME}+{keyPress}"
      value = -(i * 10)
      filename = f"QTY_OFFER_{-value:03d}.csv"
      self._generateMapping(self.mapping, key, key, gestureType, "Sell", value, f"{value} at", filename)

  #
  # MISC
  #
  def buildMisc(self):
    # spacebar
    gestureType = "Price"
    action = "Market"
    value = None
    self._generateMapping(self.mapping, " ", " ", gestureType, "Market", value, "execute market", "MARKET.csv")
    self._generateMapping(self.mapping, f"{self.OFFER_TOGGLE_NAME}+ ", f"{self.OFFER_TOGGLE_NAME}+ ",
                          gestureType, action, value, "execute market", "MARKET.csv")

    # out out out
    gestureType = "Action"
    action = "Cancel"
    value = None
    self._generateMapping(self.mapping, "-", "-", gestureType, "Cancel", value, "cancel", "CANCEL.csv")
    self._generateMapping(self.mapping, f"{self.OFFER_TOGGLE_NAME}+-", f"{self.OFFER_TOGGLE_NAME}+-",
                          gestureType, action, value, "cancel", "CANCEL.csv")

    # garbage class
    gestureType = "Action"
    action = "Garbage"
    value = None
    self._generateMapping(self.mapping, "`", "`", gestureType, "Garbage", value, "garbage class", "GARBAGE.csv")
    self._generateMapping(self.mapping, f"{self.OFFER_TOGGLE_NAME}+`", f"{self.OFFER_TOGGLE_NAME}+`",
                          gestureType, action, value, "garbage class", "GARBAGE.csv")



if __name__ == "__main__":
  keyClassMapping = KeyClassMapping()
  print(keyClassMapping.mapping)
