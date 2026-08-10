import { useNavigate } from 'react-router-dom'
import IncomeForm from '../components/IncomeForm'
import { addTransaction } from '../services/transactionService'
import { useToast } from '../context/ToastContext'

export default function AddIncome() {
  const navigate = useNavigate()
  const toast = useToast()

  async function handleSubmit(data) {
    await addTransaction(data)
    toast.success('Income added')
    navigate('/dashboard')
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="rounded-2xl bg-paper-raised dark:bg-dark-surface border border-line dark:border-dark-line p-6">
        <IncomeForm onSubmit={handleSubmit} onCancel={() => navigate(-1)} />
      </div>
    </div>
  )
}
