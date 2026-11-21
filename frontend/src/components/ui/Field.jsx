export function Field({ label, required, hint, error, children }) {
  const id = label ? label.toLowerCase().replace(/[^a-z0-9]/g, '-') : undefined;

  const defaultProps = {
    id,
    className: `w-full rounded-lg border ${
      error ? 'border-red-500' : 'border-cream'
    } bg-white px-3 py-2 text-sm text-[#4D2A00] focus:outline-none focus:ring-2 focus:ring-primary`,
  };

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[#4D2A00]">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      {hint && <p className="mb-1 text-xs text-[#4D2A00]/60">{hint}</p>}
      <div className="mt-1">
        {typeof children === 'function' ? children(defaultProps) : children}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default Field;
