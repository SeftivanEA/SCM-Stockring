export default function Toast({ message, error = false }) {
  if (!message) return null
  return (
    <div className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-white shadow-lg ${error ? 'bg-red-600' : 'bg-green-700'}`}>
      {message}
    </div>
  )
}