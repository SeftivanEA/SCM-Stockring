import { Link } from 'react-router-dom';

// breadcrumb: [{ label, to? }, ...]
export function PageHeader({ title, subtitle, breadcrumb, actions }) {
  return (
    <div className="mb-5">
      {breadcrumb && (
        <nav aria-label="Breadcrumb" className="mb-2 text-xs text-[#4D2A00]/60">
          {breadcrumb.map((crumb, index) => (
            <span key={crumb.label}>
              {index > 0 && ' / '}
              {crumb.to ? (
                <Link to={crumb.to} className="hover:underline">
                  {crumb.label}
                </Link>
              ) : (
                crumb.label
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#4D2A00]">{title}</h1>
          {subtitle && <p className="text-xs text-[#4D2A00]/60">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export default PageHeader;
