/**
 * Componente Logo que renderiza el SVG de Iglesia Bautista Omega.
 * Accesible: incluye role="img" y aria-label descriptivo.
 */

import logoSvg from '@/assets/utils/logo.svg';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = '', size = 40 }: LogoProps) {
  return (
    <img
      src={logoSvg}
      alt="Logo de Iglesia Bautista Omega"
      width={size}
      height={size}
      className={className}
      aria-hidden="false"
    />
  );
}
