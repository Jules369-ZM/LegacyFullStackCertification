// Global variables as provided in the problem
let price = 19.5;
let cid = [
  ["PENNY", 1.01],
  ["NICKEL", 2.05],
  ["DIME", 3.1],
  ["QUARTER", 4.25],
  ["ONE", 90],
  ["FIVE", 55],
  ["TEN", 20],
  ["TWENTY", 60],
  ["ONE HUNDRED", 100],
];

// Currency unit values in cents
const currencyValues = {
  PENNY: 1,
  NICKEL: 5,
  DIME: 10,
  QUARTER: 25,
  ONE: 100,
  FIVE: 500,
  TEN: 1000,
  TWENTY: 2000,
  "ONE HUNDRED": 10000,
};

// DOM elements
const cashInput = document.getElementById("cash");
const changeDueDisplay = document.getElementById("change-due");
const purchaseBtn = document.getElementById("purchase-btn");
const priceDisplay = document.getElementById("price-display");
const drawerDisplay = document.getElementById("drawer-display");
const drawerTotalDisplay = document.getElementById("drawer-total");
const resetBtn = document.getElementById("reset-btn");

// Initialize the display
function initializeDisplay() {
  priceDisplay.textContent = `$${price.toFixed(2)}`;
  updateDrawerDisplay();
}

// Update the drawer display
function updateDrawerDisplay(updatedCid = null) {
  const displayCid = updatedCid || cid;
  drawerDisplay.innerHTML = "";

  // Calculate total
  let total = 0;

  displayCid.forEach((currency) => {
    total += currency[1];

    const currencyElement = document.createElement("div");
    currencyElement.className = "currency-item";
    currencyElement.innerHTML = `
            <div class="currency-name">${currency[0]}</div>
            <div class="currency-amount">$${currency[1].toFixed(2)}</div>
        `;
    drawerDisplay.appendChild(currencyElement);
  });

  drawerTotalDisplay.textContent = `$${total.toFixed(2)}`;
}

// Calculate total cash in drawer
function calculateTotalCid(cidArray) {
  return cidArray.reduce((total, currency) => total + currency[1], 0);
}

// Convert cid to cents
function convertToCents(cidArray) {
  return cidArray.map((item) => [item[0], Math.round(item[1] * 100)]);
}

// Event listener for purchase button
purchaseBtn.addEventListener("click", handlePurchase);

// Function to handle the purchase
function handlePurchase() {
  // Get the cash input value
  const cashValue = parseFloat(cashInput.value);

  // Validate input
  if (isNaN(cashValue) || cashValue < 0) {
    alert("Please enter a valid cash amount");
    return;
  }

  // Check if customer provided enough cash
  if (cashValue < price) {
    alert("Customer does not have enough money to purchase the item");
    return;
  }

  // Check if customer paid exactly
  if (cashValue === price) {
    changeDueDisplay.textContent =
      "No change due - customer paid with exact cash";
    return;
  }

  // Calculate change due in cents (to avoid floating point issues)
  let changeDue = Math.round((cashValue - price) * 100);

  // Calculate total cash in drawer in cents
  let totalCid = Math.round(calculateTotalCid(cid) * 100);

  // If change due is more than total cash in drawer
  if (changeDue > totalCid) {
    changeDueDisplay.textContent = "Status: INSUFFICIENT_FUNDS";
    return;
  }

  // Calculate change to give
  const changeResult = calculateChange(changeDue, cid);

  // Handle different statuses
  if (changeResult.status === "INSUFFICIENT_FUNDS") {
    changeDueDisplay.textContent = "Status: INSUFFICIENT_FUNDS";
  } else if (changeResult.status === "CLOSED") {
    let resultText = "Status: CLOSED";
    // For CLOSED status, show all denominations that had money in the drawer initially
    changeResult.change.forEach((currency) => {
      if (currency[1] > 0) {
        resultText += ` ${currency[0]}: $${currency[1].toFixed(2)}`;
      }
    });
    changeDueDisplay.textContent = resultText;

    // Update the drawer display to show empty drawer
    updateDrawerDisplay(changeResult.updatedCid);
  } else {
    // Status: OPEN
    let resultText = "Status: OPEN";
    changeResult.change.forEach((currency) => {
      if (currency[1] > 0) {
        resultText += ` ${currency[0]}: $${currency[1].toFixed(2)}`;
      }
    });
    changeDueDisplay.textContent = resultText;

    // Update the drawer display with remaining cash
    updateDrawerDisplay(changeResult.updatedCid);
  }
}

// Function to calculate change
function calculateChange(changeDue, cid) {
  // Create deep copies
  let cidCopy = cid.map((item) => [...item]);
  let cidInCents = convertToCents(cidCopy);

  // Make a deep copy of cid to track what we'll have left
  let updatedCid = cidInCents.map((item) => [...item]);

  // Initialize change array with all denominations from original cid
  let change = cid.map((item) => [item[0], 0]);

  let changeRemaining = changeDue;

  // Process from highest to lowest denomination
  const denominations = [
    ["ONE HUNDRED", 10000],
    ["TWENTY", 2000],
    ["TEN", 1000],
    ["FIVE", 500],
    ["ONE", 100],
    ["QUARTER", 25],
    ["DIME", 10],
    ["NICKEL", 5],
    ["PENNY", 1],
  ];

  for (let i = 0; i < denominations.length; i++) {
    const [currencyName, currencyValue] = denominations[i];

    // Find this currency in cid
    const cidIndex = cid.findIndex((item) => item[0] === currencyName);
    if (cidIndex === -1) continue;

    let currencyAmount = updatedCid[cidIndex][1];

    // While we still need change and have this currency
    while (
      changeRemaining >= currencyValue &&
      currencyAmount >= currencyValue
    ) {
      changeRemaining -= currencyValue;
      currencyAmount -= currencyValue;
      updatedCid[cidIndex][1] -= currencyValue;

      // Update change amount
      const changeIndex = change.findIndex((item) => item[0] === currencyName);
      if (changeIndex !== -1) {
        change[changeIndex][1] += currencyValue / 100;
      }
    }
  }

  // If we couldn't give exact change
  if (changeRemaining > 0) {
    return { status: "INSUFFICIENT_FUNDS", change: [], updatedCid: cid };
  }

  // Check if drawer is now empty (CLOSED status)
  let totalRemaining = updatedCid.reduce((sum, item) => sum + item[1], 0);

  // Convert updatedCid back to dollars
  updatedCid = updatedCid.map((item) => [item[0], item[1] / 100]);

  if (totalRemaining === 0) {
    // For CLOSED status, only show denominations that had money originally
    // Filter change to only show denominations with value > 0
    let closedChange = change.filter((item) => item[1] > 0);
    return { status: "CLOSED", change: closedChange, updatedCid: updatedCid };
  }

  // For OPEN status, filter out zero-change denominations and sort highest to lowest
  let openChange = change.filter((item) => item[1] > 0);

  // Sort openChange from highest to lowest denomination
  const denominationOrder = [
    "ONE HUNDRED",
    "TWENTY",
    "TEN",
    "FIVE",
    "ONE",
    "QUARTER",
    "DIME",
    "NICKEL",
    "PENNY",
  ];
  openChange.sort((a, b) => {
    return denominationOrder.indexOf(a[0]) - denominationOrder.indexOf(b[0]);
  });

  return { status: "OPEN", change: openChange, updatedCid: updatedCid };
}

// Test case functions
function setTestCase1() {
  // Test case from requirement 11
  price = 19.5;
  cid = [
    ["PENNY", 1.01],
    ["NICKEL", 2.05],
    ["DIME", 3.1],
    ["QUARTER", 4.25],
    ["ONE", 90],
    ["FIVE", 55],
    ["TEN", 20],
    ["TWENTY", 60],
    ["ONE HUNDRED", 100],
  ];
  cashInput.value = 20;
  initializeDisplay();
  changeDueDisplay.textContent = 'Enter cash amount and click "Purchase Item"';
}

function setTestCase2() {
  // Test case from requirement 12
  price = 3.26;
  cid = [
    ["PENNY", 1.01],
    ["NICKEL", 2.05],
    ["DIME", 3.1],
    ["QUARTER", 4.25],
    ["ONE", 90],
    ["FIVE", 55],
    ["TEN", 20],
    ["TWENTY", 60],
    ["ONE HUNDRED", 100],
  ];
  cashInput.value = 100;
  initializeDisplay();
  changeDueDisplay.textContent = 'Enter cash amount and click "Purchase Item"';
}

function setTestCase3() {
  // Test case from requirement 14
  price = 19.5;
  cid = [
    ["PENNY", 0.01],
    ["NICKEL", 0],
    ["DIME", 0],
    ["QUARTER", 0],
    ["ONE", 0],
    ["FIVE", 0],
    ["TEN", 0],
    ["TWENTY", 0],
    ["ONE HUNDRED", 0],
  ];
  cashInput.value = 20;
  initializeDisplay();
  changeDueDisplay.textContent = 'Enter cash amount and click "Purchase Item"';
}

function setTestCase4() {
  // Test case from requirement 18
  price = 19.5;
  cid = [
    ["PENNY", 0.5],
    ["NICKEL", 0],
    ["DIME", 0],
    ["QUARTER", 0],
    ["ONE", 0],
    ["FIVE", 0],
    ["TEN", 0],
    ["TWENTY", 0],
    ["ONE HUNDRED", 0],
  ];
  cashInput.value = 20;
  initializeDisplay();
  changeDueDisplay.textContent = 'Enter cash amount and click "Purchase Item"';
}

// Reset to default
function resetToDefault() {
  price = 19.5;
  cid = [
    ["PENNY", 1.01],
    ["NICKEL", 2.05],
    ["DIME", 3.1],
    ["QUARTER", 4.25],
    ["ONE", 90],
    ["FIVE", 55],
    ["TEN", 20],
    ["TWENTY", 60],
    ["ONE HUNDRED", 100],
  ];
  cashInput.value = "";
  changeDueDisplay.textContent = 'Enter cash amount and click "Purchase Item"';
  initializeDisplay();
}

// Add event listeners for test buttons
document.querySelectorAll(".test-btn").forEach((button) => {
  button.addEventListener("click", function () {
    const testNum = parseInt(this.getAttribute("data-test"));

    switch (testNum) {
      case 1:
        setTestCase1();
        break;
      case 2:
        setTestCase2();
        break;
      case 3:
        setTestCase3();
        break;
      case 4:
        setTestCase4();
        break;
    }

    // Show which test is loaded
    changeDueDisplay.textContent = `Test ${testNum} loaded. Click "Purchase Item" to run.`;
  });
});

// Add event listener for reset button
resetBtn.addEventListener("click", resetToDefault);

// Also allow Enter key to trigger purchase
cashInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    handlePurchase();
  }
});

// Initialize the app
initializeDisplay();
