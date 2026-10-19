export default function FormField({ label, error, required, as: Tag = 'input', children, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <Tag
        className="mt-1 w-full rounded-lg border border-cream bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        {...props}
      >
        {children}
      </Tag>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}