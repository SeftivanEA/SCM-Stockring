const variants = {
  primary: 'bg-primary text-ink hover:bg-secondary hover:text-white',
  outline: 'border-2 border-secondary text-secondary hover:bg-cream',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

export default function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button
      className={`rounded-lg px-4 py-2 font-semibold transition-colors ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}