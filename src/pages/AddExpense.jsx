import { useNavigate } from 'react-router-dom'
import ExpenseForm from '../components/ExpenseForm'
import { addTransaction } from '../services/transactionService'
import { useToast } from '../context/ToastContext'

export default function AddExpense() {
  const navigate = useNavigate()
  const toast = useToast()

  async function handleSubmit(data) {
    await addTransaction(data)
    toast.success('Expense added')
    navigate('/dashboard')
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="rounded-2xl bg-paper-raised dark:bg-dark-surface border border-line dark:border-dark-line p-6">
        <ExpenseForm onSubmit={handleSubmit} onCancel={() => navigate(-1)} />
      </div>
    </div>
  )
}
