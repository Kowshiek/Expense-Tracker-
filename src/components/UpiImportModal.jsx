import { useState } from 'react'
import {
  ArrowDownLeft, ArrowUpRight, CheckCircle2,
  Copy, Sparkles, AlertCircle, RefreshCw,
} from 'lucide-react'
import Modal from './Modal'
import { parseUpiMessage, autoAddUpiTransaction } from '../services/upiService'
import { useToast } from '../context/ToastContext'
import { formatCurrency } from '../utils/currency'
import { useSettings } from '../hooks/useSettings'

const SAMPLE_TRANSACTIONS = [
  {
    label: 'HDFC UPI Debit (Swiggy ₹340)',
    sms: 'Dear UPI user A/C **4589 debited by 340.00 on 26-Oct-26 to VPA swiggy@icici Ref no 329482938492. -HDFC Bank',
  },
  {
    label: 'SBI UPI Credit (Salary ₹45,000)',
    sms: 'Dear Customer, A/c *1234 credited by Rs 45,000.00 on 26-Oct-26 by UPI/payroll@sbi Ref no 839284920192. Bal: Rs 52,400 -SBI',
  },
  {
    label: 'PhonePe UPI Debit (Blinkit ₹520)',
    sms: 'Paid Rs. 520 to Blinkit using UPI on PhonePe. Txn ID: T2410261948238492',
  },
  {
    label: 'ICICI UPI Debit (Petrol ₹800)',
    sms: 'INR 800.00 debited from ICICI Bank A/c XX902 on 26-Oct-26 towards HPCL Fuel Station. UTR: 429184918239',
  },
  {
    label: 'GPay UPI Credit (Friend ₹1,200)',
    sms: 'Received Rs. 1,200.00 in your Paytm Payments Bank A/C from rahul@okhdfcbank via Google Pay. Ref 948201847192',
  },
]

export default function UpiImportModal({ open, onClose, onTransactionAdded, initialText = '' }) {
  const [inputText, setInputText] = useState(initialText)
  const [parsed, setParsed] = useState(() => (initialText ? parseUpiMessage(initialText) : null))
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  const { settings } = useSettings()
  const currency = settings?.currency || 'INR'

  useState(() => {
    if (initialText) {
      setInputText(initialText)
      setParsed(parseUpiMessage(initialText))
    }
  })

  const handleTextChange = (val) => {
    setInputText(val)
    if (val.trim()) {
      const res = parseUpiMessage(val)
      setParsed(res)
    } else {
      setParsed(null)
    }
  }

  const handlePasteClipboard = async () => {
    try {
      if (!navigator.clipboard?.readText) {
        toast.error('Clipboard access is not permitted in this browser.')
        return
      }
      const text = await navigator.clipboard.readText()
      if (!text || !text.trim()) {
        toast.error('Clipboard is empty. Copy a UPI SMS first!')
        return
      }
      handleTextChange(text)
      toast.success('Pasted from clipboard!')
    } catch {
      toast.error('Could not access clipboard. Please paste manually into the box.')
    }
  }

  const handleSave = async () => {
    if (!parsed) return
    setBusy(true)
    try {
      const res = await autoAddUpiTransaction(inputText)
      toast.success(
        `Added ${res.parsed.type === 'expense' ? 'Debit' : 'Credit'} of ${formatCurrency(
          res.parsed.amount,
          currency
        )} via ${res.parsed.bankName}`
      )
      setInputText('')
      setParsed(null)
      onTransactionAdded?.(res.transaction)
      onClose?.()
    } catch (err) {
      toast.error(err.message || 'Failed to save UPI transaction.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="⚡ Auto-Detect UPI Transaction">
      <div className="space-y-4">
        <p className="text-xs text-ink-faint leading-relaxed">
          Paste any UPI or Bank debit/credit notification SMS. SpendWise automatically extracts the amount, banking institution, debited/credited type, and category.
        </p>

        <div className="flex gap-2">
          <button
            onClick={handlePasteClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest/10 hover:bg-forest/20 text-forest text-xs font-semibold transition-colors"
          >
            <Copy size={14} /> Paste from Clipboard
          </button>
        </div>

        <div className="relative">
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Paste your UPI SMS here (e.g. 'Dear user A/c **1234 debited by Rs 250.00 to Swiggy... -HDFC Bank')"
            className="w-full text-xs font-mono rounded-xl border border-line dark:border-dark-line bg-paper dark:bg-dark-bg text-ink dark:text-white p-3 focus:border-forest outline-none resize-none"
          />
          {inputText && (
            <button
              onClick={() => handleTextChange('')}
              className="absolute top-2 right-2 text-xs text-ink-faint hover:text-ink px-1.5 py-0.5"
            >
              Clear
            </button>
          )}
        </div>

        {/* Live Parsed Preview */}
        {parsed ? (
          <div className="rounded-xl p-3.5 bg-paper-raised dark:bg-dark-surface border border-line dark:border-dark-line space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-forest" />
                Parsed Transaction
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  parsed.type === 'income'
                    ? 'bg-forest/15 text-forest'
                    : 'bg-clay/15 text-clay'
                }`}
              >
                {parsed.type === 'income' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                {parsed.type === 'income' ? 'CREDITED (Income)' : 'DEBITED (Expense)'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-paper dark:bg-dark-bg">
                <span className="text-ink-faint block text-[10px] uppercase font-semibold">Amount</span>
                <span className="font-mono-num font-bold text-base text-ink dark:text-white">
                  {formatCurrency(parsed.amount, currency)}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-paper dark:bg-dark-bg">
                <span className="text-ink-faint block text-[10px] uppercase font-semibold">Bank / Provider</span>
                <span className="font-semibold text-ink dark:text-white truncate block">
                  {parsed.bankName}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-paper dark:bg-dark-bg">
                <span className="text-ink-faint block text-[10px] uppercase font-semibold">Category</span>
                <span className="font-semibold text-ink dark:text-white">{parsed.category}</span>
              </div>
              <div className="p-2 rounded-lg bg-paper dark:bg-dark-bg">
                <span className="text-ink-faint block text-[10px] uppercase font-semibold">Beneficiary / Party</span>
                <span className="font-semibold text-ink dark:text-white truncate block">
                  {parsed.beneficiary || 'Direct UPI'}
                </span>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={busy}
              className={`w-full py-2.5 px-4 rounded-xl text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 ${
                parsed.type === 'income'
                  ? 'bg-forest hover:bg-forest-dark'
                  : 'bg-clay hover:bg-clay/90'
              }`}
            >
              {busy ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Saving…
                </>
              ) : (
                `Confirm & Add as ${parsed.type === 'income' ? 'Income' : 'Expense'}`
              )}
            </button>
          </div>
        ) : inputText.trim() ? (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>Could not detect debited or credited UPI amounts. Check format or test with sample below.</span>
          </div>
        ) : null}

        {/* Quick Simulator Buttons */}
        <div className="pt-2 border-t border-line dark:border-dark-line">
          <span className="text-[11px] font-semibold text-ink-faint flex items-center gap-1.5 mb-2">
            <Sparkles size={12} className="text-amber" />
            Try Sample UPI SMS:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_TRANSACTIONS.map((st) => (
              <button
                key={st.label}
                type="button"
                onClick={() => handleTextChange(st.sms)}
                className="text-[11px] px-2 py-1 rounded-lg border border-line dark:border-dark-line bg-paper dark:bg-dark-bg text-ink-soft dark:text-ink-faint hover:border-forest hover:text-forest transition-colors"
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
