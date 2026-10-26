import { addTransaction } from './transactionService.js'
import { getCycleDate } from '../utils/dateHelpers.js'
import { syncDatabaseToGithub } from './githubSyncService.js'

// Indian Banking & Payment providers
const BANK_PATTERNS = [
  { name: 'Paytm Payments Bank', regex: /\b(?:Paytm\s*Payments\s*Bank|Paytm\s*Bank)\b/i },
  { name: 'State Bank of India (SBI)', regex: /\b(?:State\s*Bank\s*of\s*India|SBIN|\bSBI\b)/i },
  { name: 'HDFC Bank', regex: /\b(?:HDFC\s*Bank|HDFCBK|\bHDFC\b)(?!bank|\.com)/i },
  { name: 'ICICI Bank', regex: /\b(?:ICICI\s*Bank|ICICIB|\bICICI\b)(?!bank|\.com)/i },
  { name: 'Axis Bank', regex: /\b(?:Axis\s*Bank|AXISBK|\bAXIS\b)(?!bank|\.com)/i },
  { name: 'Kotak Mahindra Bank', regex: /\b(?:Kotak\s*Bank|Kotak\s*Mahindra|\bKOTAK\b)/i },
  { name: 'Punjab National Bank (PNB)', regex: /\b(?:Punjab\s*National\s*Bank|\bPNB\b)/i },
  { name: 'Bank of Baroda', regex: /\b(?:Bank\s*of\s*Baroda|\bBOB\b)/i },
  { name: 'Canara Bank', regex: /\b(?:Canara\s*Bank|\bCANARA\b)/i },
  { name: 'Union Bank of India', regex: /\b(?:Union\s*Bank|\bUBIN\b|\bUNIONB\b)/i },
  { name: 'IndusInd Bank', regex: /\b(?:IndusInd\s*Bank|IndusInd)/i },
  { name: 'IDFC FIRST Bank', regex: /\b(?:IDFC\s*FIRST\s*Bank|\bIDFC\b)/i },
  { name: 'Yes Bank', regex: /\b(?:Yes\s*Bank|\bYESB\b)/i },
  { name: 'Federal Bank', regex: /\b(?:Federal\s*Bank)/i },
  { name: 'Google Pay', regex: /\b(?:Google\s*Pay|\bGPay\b)/i },
  { name: 'PhonePe', regex: /\b(?:PhonePe)/i },
  { name: 'Paytm', regex: /\b(?:Paytm)\b/i },
  { name: 'CRED', regex: /\b(?:CRED)\b/i },
  { name: 'Amazon Pay', regex: /\b(?:Amazon\s*Pay|AMZPAY)/i },
  { name: 'BHIM UPI', regex: /\b(?:BHIM\s*UPI|\bBHIM\b|\bNPCI\b)/i },
  { name: 'Jupiter', regex: /\b(?:Jupiter\s*Money|Jupiter)/i },
  { name: 'Fi Money', regex: /\b(?:Fi\s*Money|FiBank)/i },
]

// Merchant category mapping for automatic categorization
const CATEGORY_RULES = [
  {
    category: 'Food',
    regex: /(?:swiggy|zomato|mcdonalds|starbucks|dominos|pizza|burger|kfc|cafe|restaurant|bakery|biryani|chai|tea|hotel|eat)/i,
  },
  {
    category: 'Groceries',
    regex: /(?:blinkit|zepto|instamart|bigbasket|bbdaily|dmart|supermarket|grocery|milk|dairy|vegetables|fruits|nature'?s\s*basket)/i,
  },
  {
    category: 'Transport',
    regex: /(?:uber|ola|rapido|irctc|metro|railways|redbus|fuel|petrol|diesel|hpcl|bpcl|iocl|fastag|toll|parking|yulu)/i,
  },
  {
    category: 'Shopping',
    regex: /(?:amazon|flipkart|myntra|ajio|meesho|nykaa|tata\s*cliq|croma|reliance|zara|h&m|decathlon|store|mall|clothing)/i,
  },
  {
    category: 'Bills',
    regex: /(?:airtel|jio|vodafone|vi\s*bill|bescom|tneb|electricity|water\s*board|gas\s*bill|broadband|dth|tata\s*play|recharge|billdesk)/i,
  },
  {
    category: 'Entertainment',
    regex: /(?:netflix|prime|hotstar|disney|spotify|youtube|bookmyshow|pvr|inox|cinema|movie|theatre)/i,
  },
  {
    category: 'Health',
    regex: /(?:apollo|pharmeasy|1mg|tata\s*1mg|netmeds|medplus|pharmacy|hospital|clinic|doctor|diagnostics|dental)/i,
  },
  {
    category: 'Travel',
    regex: /(?:makemytrip|goibibo|cleartrip|indigo|air\s*india|vistara|spicejet|resort|flight|hotel\s*booking)/i,
  },
  {
    category: 'Rent',
    regex: /(?:rent|society\s*maintenance|landlord|nobroker|nestaway)/i,
  },
]

const INCOME_CATEGORY_RULES = [
  {
    category: 'Salary',
    regex: /(?:salary|payroll|stipend|wages|employer|direct\s*deposit)/i,
  },
  {
    category: 'Freelance',
    regex: /(?:freelance|consulting|client|upwork|fiverr|contract)/i,
  },
  {
    category: 'Investment',
    regex: /(?:dividend|zerodha|groww|upstox|mutual\s*fund|interest|fixed\s*deposit|stocks)/i,
  },
  {
    category: 'Gift',
    regex: /(?:gift|cashback|reward|congratulations|prize)/i,
  },
]

/**
 * Intelligent parser for Indian Bank & UPI SMS messages.
 * Extracts:
 * - type: 'expense' (debited) vs 'income' (credited)
 * - amount: numerical value
 * - bankName: detected banking institution or UPI app
 * - beneficiary: person/merchant name or VPA
 * - category: intelligently inferred
 * - referenceId: UTR / Reference number
 */
export function parseUpiMessage(rawText) {
  if (!rawText || typeof rawText !== 'string') return null
  const text = rawText.trim()

  // 1. Determine Debit vs Credit
  // Patterns for debit/expense
  const debitRegex = /(?:debited|debit|paid|sent|transferred\s+to|spent|withdrawn|purchase(?:d)?)/i
  // Patterns for credit/income
  const creditRegex = /(?:credited|credit|received|transferred\s+from|deposited|added\s+to|refund(?:ed)?|cashback)/i

  const isDebit = debitRegex.test(text)
  const isCredit = creditRegex.test(text)

  if (!isDebit && !isCredit) {
    // Cannot identify if money came in or went out
    return null
  }

  // If both match, look at which keyword comes first or strongest
  let type = 'expense'
  if (isCredit && !isDebit) {
    type = 'income'
  } else if (isDebit && isCredit) {
    const debitIndex = text.search(debitRegex)
    const creditIndex = text.search(creditRegex)
    type = creditIndex < debitIndex ? 'income' : 'expense'
  }

  // 2. Extract Amount
  // Matches: Rs. 500, Rs 1,500.50, INR 250, ₹100, debited by 300, etc.
  const amountPatterns = [
    /(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:debited|credited)\s+(?:by|for|with)?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:amount|amt)\s*(?:of)?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:paying|paid|sent|received)\s+(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i,
  ]

  let amount = null
  for (const pattern of amountPatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const cleanNum = parseFloat(match[1].replace(/,/g, ''))
      if (!isNaN(cleanNum) && cleanNum > 0) {
        amount = cleanNum
        break
      }
    }
  }

  if (!amount) return null

  // 3. Extract Bank Name / UPI Provider
  let bankName = 'UPI App'
  for (const b of BANK_PATTERNS) {
    if (b.regex.test(text)) {
      bankName = b.name
      break
    }
  }

  // 4. Extract Beneficiary / Merchant / VPA
  let beneficiary = ''
  const beneficiaryPatterns = [
    /(?:to|towards)\s+([A-Za-z0-9\s.@&_-]{2,30}?)(?:\s+on|\s+ref|\s+via|\s+thru|\s+using|\s+with|\.|\svpa|\sA\/c|\sbal)/i,
    /(?:from)\s+([A-Za-z0-9\s.@&_-]{2,30}?)(?:\s+on|\s+ref|\s+via|\s+thru|\s+using|\s+with|\.|\svpa|\sA\/c|\sbal)/i,
    /(?:VPA|UPI\s*ID)\s*[:-]?\s*([a-zA-Z0-9.\-_@]+)/i,
  ]

  for (const pattern of beneficiaryPatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const cleaned = match[1].replace(/^(vpa|upi|ref|ac)\s*/i, '').trim()
      if (cleaned.length > 1 && !/^(the|a|an|your|my)$/i.test(cleaned)) {
        beneficiary = cleaned
        break
      }
    }
  }

  // 5. Extract Reference / UTR Number
  let referenceId = ''
  const refPatterns = [
    /(?:Ref(?:\.|\s*no|\s*id)?|UPI\s*ref|UTR)\s*[:\s\-#]?\s*([A-Za-z0-9]{6,22})/i,
    /(?:Txn(?:\.|\s*id|\s*no)?)\s*[:\s\-#]?\s*([A-Za-z0-9]{6,22})/i,
  ]
  for (const pattern of refPatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      referenceId = match[1].trim()
      break
    }
  }

  // 6. Infer Category
  let category = 'Other'
  const rules = type === 'income' ? INCOME_CATEGORY_RULES : CATEGORY_RULES
  for (const rule of rules) {
    if (rule.regex.test(text)) {
      category = rule.category
      break
    }
  }

  // 7. Generate clean transaction title
  const counterparty = beneficiary || (type === 'expense' ? 'Merchant' : 'Sender')
  const title = `UPI ${type === 'expense' ? 'Debit' : 'Credit'} · ${counterparty} (${bankName})`

  return {
    type,
    amount,
    bankName,
    beneficiary,
    category,
    referenceId,
    title,
    paymentMethod: 'UPI',
    date: getCycleDate(new Date()),
    notes: `Bank: ${bankName}${beneficiary ? ` | Party: ${beneficiary}` : ''}${
      referenceId ? ` | Ref/UTR: ${referenceId}` : ''
    }\nSource: UPI SMS`,
    rawText,
  }
}

/**
 * Automatically parses and records a UPI transaction into IndexedDB.
 * Also initiates background sync to GitHub if configured!
 */
export async function autoAddUpiTransaction(rawText) {
  const parsed = parseUpiMessage(rawText)
  if (!parsed) {
    throw new Error('Could not identify a valid UPI debit or credit amount in this message.')
  }

  const transactionData = {
    type: parsed.type,
    amount: parsed.amount,
    title: parsed.title,
    category: parsed.category,
    paymentMethod: 'UPI',
    date: parsed.date,
    notes: parsed.notes,
  }

  const saved = await addTransaction(transactionData)

  // Trigger non-blocking GitHub auto-sync if user has enabled it
  try {
    syncDatabaseToGithub().catch((err) => {
      console.warn('GitHub auto-sync skipped or deferred:', err.message)
    })
  } catch {
    // Non-blocking
  }

  return {
    success: true,
    parsed,
    transaction: saved,
  }
}
