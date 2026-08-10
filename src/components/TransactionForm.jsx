import ExpenseForm from './ExpenseForm'
import IncomeForm from './IncomeForm'

// Generic wrapper used when editing an existing transaction of unknown type
// (add flows use ExpenseForm / IncomeForm directly since the type is fixed).
export default function TransactionForm({ transaction, onSubmit, onCancel }) {
  if (transaction.type === 'income') {
    return <IncomeForm initial={transaction} onSubmit={onSubmit} onCancel={onCancel} submitLabel="Save changes" />
  }
  return <ExpenseForm initial={transaction} onSubmit={onSubmit} onCancel={onCancel} submitLabel="Save changes" />
}
