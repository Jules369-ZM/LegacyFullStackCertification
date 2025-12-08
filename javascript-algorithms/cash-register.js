function checkCashRegister(price, cash, cid) {
  // Define the currency units in cents to avoid floating point issues
  const currencyUnits = [
    { name: "PENNY", value: 1 },
    { name: "NICKEL", value: 5 },
    { name: "DIME", value: 10 },
    { name: "QUARTER", value: 25 },
    { name: "ONE", value: 100 },
    { name: "FIVE", value: 500 },
    { name: "TEN", value: 1000 },
    { name: "TWENTY", value: 2000 },
    { name: "ONE HUNDRED", value: 10000 }
  ];

  // Calculate the change needed in cents
  let changeDue = (cash - price) * 100;
  let totalCashInDrawer = 0;
  let change = [];

  // Calculate total cash in drawer
  for (let denomination of cid) {
    totalCashInDrawer += denomination[1] * 100;
  }

  // Check if there's insufficient funds
  if (totalCashInDrawer < changeDue) {
    return { status: "INSUFFICIENT_FUNDS", change: [] };
  }

  // Check if exact change can be made
  if (totalCashInDrawer === changeDue) {
    return { status: "CLOSED", change: cid };
  }

  // Calculate change starting from largest denomination
  for (let i = currencyUnits.length - 1; i >= 0; i--) {
    const unit = currencyUnits[i];
    const unitAmount = cid[i][1] * 100; // Convert to cents
    let unitCount = Math.floor(unitAmount / unit.value);
    let unitChange = 0;

    while (changeDue >= unit.value && unitCount > 0) {
      changeDue -= unit.value;
      unitCount--;
      unitChange += unit.value;
    }

    if (unitChange > 0) {
      change.push([unit.name, unitChange / 100]); // Convert back to dollars
    }
  }

  // Check if we couldn't make exact change
  if (changeDue > 0) {
    return { status: "INSUFFICIENT_FUNDS", change: [] };
  }

  return { status: "OPEN", change: change };
}

// Test cases
console.log(checkCashRegister(19.5, 20, [["PENNY", 1.01], ["NICKEL", 2.05], ["DIME", 3.1], ["QUARTER", 4.25], ["ONE", 90], ["FIVE", 55], ["TEN", 20], ["TWENTY", 60], ["ONE HUNDRED", 100]]));
// {status: "OPEN", change: [["QUARTER", 0.5]]}

console.log(checkCashRegister(3.26, 100, [["PENNY", 1.01], ["NICKEL", 2.05], ["DIME", 3.1], ["QUARTER", 4.25], ["ONE", 90], ["FIVE", 55], ["TEN", 20], ["TWENTY", 60], ["ONE HUNDRED", 100]]));
// {status: "OPEN", change: [["TWENTY", 60], ["TEN", 20], ["FIVE", 15], ["ONE", 1], ["QUARTER", 0.5], ["DIME", 0.2], ["PENNY", 0.04]]}

console.log(checkCashRegister(19.5, 20, [["PENNY", 0.01], ["NICKEL", 0], ["DIME", 0], ["QUARTER", 0], ["ONE", 0], ["FIVE", 0], ["TEN", 0], ["TWENTY", 0], ["ONE HUNDRED", 0]]));
// {status: "INSUFFICIENT_FUNDS", change: []}

console.log(checkCashRegister(19.5, 20, [["PENNY", 0.5], ["NICKEL", 0], ["DIME", 0], ["QUARTER", 0], ["ONE", 0], ["FIVE", 0], ["TEN", 0], ["TWENTY", 0], ["ONE HUNDRED", 0]]));
// {status: "CLOSED", change: [["PENNY", 0.5], ["NICKEL", 0], ["DIME", 0], ["QUARTER", 0], ["ONE", 0], ["FIVE", 0], ["TEN", 0], ["TWENTY", 0], ["ONE HUNDRED", 0]]}
