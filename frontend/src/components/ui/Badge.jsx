const variants = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-cream text-secondary',
  danger: 'bg-red-100 text-red-700',
  neutral: 'bg-ink text-cream',
}

export default function Badge({ variant = 'neutral', children }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  )
}