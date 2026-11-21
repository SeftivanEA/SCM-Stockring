import { useAuth } from '../context/useAuth';
import { menuItems } from '../utils/menu';

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role || '';

  const canEdit = role === 'pemilik' || role === 'pendataan';
  const canManageWarehouse = role === 'pemilik';

  const canAccess = (path) => {
    if (!user) return false;
    const item = menuItems.find((m) => m.path === path);
    return !item || item.roles.includes(role);
  };

  return {
    canEdit,
    canManageWarehouse,
    canAccess,
    role,
    user,
  };
}

export default usePermissions;
