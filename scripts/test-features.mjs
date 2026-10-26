import { parseUpiMessage } from '../src/services/upiService.js'
import { getCycleDate, getNextCycleResetTime, getTimeUntilNextReset } from '../src/utils/dateHelpers.js'

console.log('--- Testing 12:01 AM Daily Cycle Logic ---')
const testMidnight = new Date('2026-10-26T00:00:30')
const cycleBefore1201 = getCycleDate(testMidnight)
console.log('At 00:00:30 AM (before 12:01 AM): Cycle date =', cycleBefore1201, '(belongs to yesterday: 2026-10-25 -> PASS:', cycleBefore1201 === '2026-10-25')

const test1201 = new Date('2026-10-26T00:01:00')
const cycleAt1201 = getCycleDate(test1201)
console.log('At 00:01:00 AM (at 12:01 AM): Cycle date =', cycleAt1201, '(new expense day starts: 2026-10-26 -> PASS:', cycleAt1201 === '2026-10-26')

const nextReset = getNextCycleResetTime(new Date())
console.log('Next 12:01 AM reset time =', nextReset.toLocaleString())
console.log('Time until 12:01 AM reset =', getTimeUntilNextReset(new Date()))

console.log('\n--- Testing UPI Debit & Credit Parser ---')
const testCases = [
  {
    name: 'HDFC Debit (Swiggy ₹340)',
    sms: 'Dear UPI user A/C **4589 debited by 340.00 on 26-Oct-26 to VPA swiggy@icici Ref no 329482938492. -HDFC Bank',
    expectedType: 'expense',
    expectedAmount: 340,
    expectedBank: 'HDFC Bank',
    expectedCategory: 'Food',
  },
  {
    name: 'SBI Credit (Salary ₹45,000)',
    sms: 'Dear Customer, A/c *1234 credited by Rs 45,000.00 on 26-Oct-26 by UPI/payroll@sbi Ref no 839284920192. Bal: Rs 52,400 -SBI',
    expectedType: 'income',
    expectedAmount: 45000,
    expectedBank: 'State Bank of India (SBI)',
    expectedCategory: 'Salary',
  },
  {
    name: 'PhonePe Debit (Blinkit ₹520)',
    sms: 'Paid Rs. 520 to Blinkit using UPI on PhonePe. Txn ID: T2410261948238492',
    expectedType: 'expense',
    expectedAmount: 520,
    expectedBank: 'PhonePe',
    expectedCategory: 'Groceries',
  },
  {
    name: 'ICICI Debit (Fuel ₹800)',
    sms: 'INR 800.00 debited from ICICI Bank A/c XX902 on 26-Oct-26 towards HPCL Fuel Station. UTR: 429184918239',
    expectedType: 'expense',
    expectedAmount: 800,
    expectedBank: 'ICICI Bank',
    expectedCategory: 'Transport',
  },
  {
    name: 'GPay Credit (Friend ₹1,200)',
    sms: 'Received Rs. 1,200.00 in your Paytm Payments Bank A/C from rahul@okhdfcbank via Google Pay. Ref 948201847192',
    expectedType: 'income',
    expectedAmount: 1200,
    expectedBank: 'Paytm Payments Bank',
  },
  {
    name: 'Send Keyword Test',
    sms: 'You send Rs 250 to Ramesh via PhonePe UPI. Ref: 983274982',
    expectedType: 'expense',
    expectedAmount: 250,
    expectedBank: 'PhonePe',
  },
  {
    name: 'Debited Keyword Test',
    sms: '350.00 debited from Axis Bank A/c 4321 for groceries',
    expectedType: 'expense',
    expectedAmount: 350,
    expectedBank: 'Axis Bank',
  },
  {
    name: 'Received Keyword Test',
    sms: 'Received Rs 500 in Google Pay from Friend',
    expectedType: 'income',
    expectedAmount: 500,
    expectedBank: 'Google Pay',
  },
  {
    name: 'Credited Keyword Test',
    sms: 'A/c XX890 credited by Rs 2500 from UPI/Kotak Ref 8392819',
    expectedType: 'income',
    expectedAmount: 2500,
    expectedBank: 'Kotak Mahindra Bank',
  },
]

let allPassed = true
for (const tc of testCases) {
  const result = parseUpiMessage(tc.sms)
  if (!result) {
    console.error(`FAIL: ${tc.name} returned null!`)
    allPassed = false
    continue
  }
  const typeMatch = result.type === tc.expectedType
  const amountMatch = result.amount === tc.expectedAmount
  const bankMatch = result.bankName === tc.expectedBank
  const catMatch = tc.expectedCategory ? result.category === tc.expectedCategory : true

  if (typeMatch && amountMatch && bankMatch && catMatch) {
    console.log(`PASS: ${tc.name} -> Type: ${result.type}, Amt: ₹${result.amount}, Bank: ${result.bankName}, Cat: ${result.category}`)
  } else {
    console.error(`FAIL: ${tc.name}`, result)
    allPassed = false
  }
}

if (allPassed) {
  console.log('\nAll test cases PASSED successfully!')
} else {
  process.exit(1)
}
