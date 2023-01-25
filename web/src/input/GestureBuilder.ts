//GestureMap return gesture types
//These are coupled with classifier - think of classifier as a pointer
//and the map/gesture as direct, expanded info
//
//gesture gets used in inputBufferState - which takes the type or action; uses
//timers to adds/subtracts sequential gestures to determine ultimate value and action

export enum GestureType {
  Qty,    //+/- number
  Price,  //number
  Action  //Execute, Cancel
}

export interface Gesture {
  type: GestureType,
  action: string | null,
  digit_length: number,
  value: number,
}

export default class GestureBuilder {

  public meta: Gesture | any;

  constructor() {
    this.meta = {};
  }

  async load(meta_filename: string = './meta.json') {

    this.meta = await fetch(meta_filename)
      .then(res => res.json())
      .catch(e => {
        console.error("ERR loading meta", e);
        return {};
      });

  }

  //TODO: getGarbageClass() for probability tolerance
  loadGarbageClass(){}
  checkTolerance(gestureData: any) {}

  //TODO: add value:number, type:string

  //expand
  //{"0": {"description": "execute market", "filename": "EXECUTE.csv", "index": 0, "keypress": " "},
  // "10": {"description": "offer 4", "filename": "PRICE_OFFER_4.csv", "index": 10, "keypress": "ALT+4"},
  build(classifier_arg: any): Gesture {

    const meta = this.meta[ classifier_arg ] as any;
    const value = meta.value;
    const type = (GestureType as any)[meta.type];
    const digit_length = value === null ? 0 : String(value).length;

    //Gesture
    return {
      ...meta,
      type,
      action: null,
      digit_length
    };
  }


/*
  getGestureValue(classNum) {
    const vals = {
      0: 1,
      1: 2,
      2: 3,
      3: 10,
      4: 70,
      5: 100,
      6: null,
      null: null,
    };

    return vals[parseInt(classNum)];
  }
*/
}