/**
 * Header principal de la aplicación.
 * Contiene logo, navegación, controles de auth y toggle de tema.
 */

import { NavLink, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/ui';
import { useTheme, useAuth } from '@/core/hooks';

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <circle cx={12} cy={12} r={5} />
      <line x1={12} y1={1} x2={12} y2={3} />
      <line x1={12} y1={21} x2={12} y2={23} />
      <line x1={4.22} y1={4.22} x2={5.64} y2={5.64} />
      <line x1={18.36} y1={18.36} x2={19.78} y2={19.78} />
      <line x1={1} y1={12} x2={3} y2={12} />
      <line x1={21} y1={12} x2={23} y2={12} />
      <line x1={4.22} y1={19.78} x2={5.64} y2={18.36} />
      <line x1={18.36} y1={5.64} x2={19.78} y2={4.22} />
    </svg>
  );
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-primary-800',
    isActive
      ? 'bg-primary-700 text-white'
      : 'text-primary-100 hover:bg-primary-700 hover:text-white',
  ].join(' ');

const iconBtnClass = [
  'inline-flex items-center justify-center w-9 h-9 rounded-md',
  'text-primary-100 hover:bg-primary-700 hover:text-white',
  'transition-colors duration-150',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-primary-800',
].join(' ');

const iconNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'inline-flex items-center justify-center w-9 h-9 rounded-md transition-colors duration-150',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-primary-800',
    isActive
      ? 'bg-primary-700 text-white'
      : 'text-primary-100 hover:bg-primary-700 hover:text-white',
  ].join(' ');

export function Header() {
  const { isDark, toggle } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const canCreateHymn =
    isAuthenticated && user !== null && (user.role === 'admin' || user.role === 'editor');

  const canManageUsers = isAuthenticated && user !== null && user.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <header className="bg-primary-800 text-white shadow-lg" role="banner">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Marca/Logo */}
        <NavLink
          to="/"
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-800 rounded-md"
          aria-label="Ir al inicio - Iglesia Bautista Omega Himnario"
        >
          <Logo
            size={40}
            className="rounded-full ring-2 ring-primary-600 group-hover:ring-primary-400 transition-all"
          />
          <div>
            <span className="block text-lg font-bold leading-tight tracking-wide">
              Iglesia Bautista Omega
            </span>
            <span className="block text-xs text-primary-200 font-normal tracking-wider uppercase">
              Himnario
            </span>
          </div>
        </NavLink>

        {/* Controles de navegación y tema */}
        <div className="flex items-center gap-2">
          <nav aria-label="Navegación principal">
            <ul className="flex items-center gap-1" role="list">
              <li>
                <NavLink to="/" className={navLinkClass} end>
                  Himnos
                </NavLink>
              </li>

              {/* Nuevo himno — visible solo para admin/editor */}
              {canCreateHymn && (
                <li>
                  <NavLink
                    to="/himno/nuevo"
                    className={iconNavLinkClass}
                    title="Nuevo himno"
                    aria-label="Crear nuevo himno"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                      aria-hidden="true"
                    >
                      <path d="M9 18V5l12-2v13" />
                      <circle cx="6" cy="18" r="3" />
                      <circle cx="18" cy="16" r="3" />
                    </svg>
                  </NavLink>
                </li>
              )}

              {/* Nuevo usuario — visible solo para admin */}
              {canManageUsers && (
                <li>
                  <NavLink
                    to="/admin/usuarios/nuevo"
                    className={iconNavLinkClass}
                    title="Nuevo usuario"
                    aria-label="Crear nuevo usuario"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                      aria-hidden="true"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <line x1="19" y1="8" x2="19" y2="14" />
                      <line x1="22" y1="11" x2="16" y2="11" />
                    </svg>
                  </NavLink>
                </li>
              )}
            </ul>
          </nav>

          {/* Auth: nombre de usuario + logout, o botón login */}
          {isAuthenticated && user !== null ? (
            <div className="flex items-center gap-2">
              <span
                className="hidden sm:block text-xs text-primary-200 max-w-[120px] truncate"
                title={user.name}
                aria-label={`Sesión iniciada como ${user.name}`}
              >
                {user.name}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className={[
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  'text-primary-100 hover:bg-primary-700 hover:text-white',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-primary-800',
                ].join(' ')}
                aria-label="Cerrar sesión"
              >
                Salir
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className={[
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                'text-primary-100 hover:bg-primary-700 hover:text-white',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-primary-800',
              ].join(' ')}
            >
              Ingresar
            </NavLink>
          )}

          {/* Toggle de tema */}
          <button
            type="button"
            onClick={toggle}
            aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
            title={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
            className={iconBtnClass}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}
