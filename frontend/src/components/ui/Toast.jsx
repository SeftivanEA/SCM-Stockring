export default function Toast({ message }) {
  if (!message) return null
  return (
    <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-green-700 px-4 py-3 text-white shadow-lg">
      {message}
    </div>
  )
}