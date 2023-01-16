export default class Transaction {

  //? can I ever have a transaction with partial fills on both sides?
  // does this even matter? ideally treat a partial/full fill the same

  //create Transaction whenever two orders match?
  //do we even need to track this? maybe to reconcile score

  constructor() {

    //initial order
    //component fills

    //buy 50   <-- order A
    // fill 25 <-- order B
    // fill 25 <-- order C

    //Transaction: initial order A - components order B, order C
    //Transaction: initial order B - component A
    //Transaction: initial order C - component A
  }
}