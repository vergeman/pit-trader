export default class MatchingEngine {

  //Possible classes:
  //* Order, Transaction (composed of multiple order(s) on each side)
  //*  Trader/Player class
  //* RiskCheck(Player, Order)
  //* Reporter - could just expose Matching Engine bits?

  constructor(test: string) {
    //TODO: add priorityqueues of Order types
  }


  process(order: number) {
    console.log(order);
    //state logic
    //returns Transaction, success / error

  }

  //riskChecker() - likely move out to separate class

  //partial fill logic

  //Reporter

}

const me = new MatchingEngine("test");