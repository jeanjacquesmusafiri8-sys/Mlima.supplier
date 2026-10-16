import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'stacked' | 'icon' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Composant Logo officiel MLIMA Supplier
 * Reproduit fidèlement la géométrie vectorielle du logo officiel :
 * - Double sommet montagneux avec facette gauche or (#F7A814)
 * - Sommet principal bleu marine (#002855) avec évidement triangulaire
 * - Arche courbée dynamique à la base
 * - Typographie officielle : "MLIMA" en bleu marine bold et "Supplier" en jaune doré
 */
export const Logo: React.FC<LogoProps> = ({
  className = '',
  variant = 'full',
  size = 'md',
}) => {
  const isWhite = variant === 'white';
  const blueColor = isWhite ? '#FFFFFF' : '#002855';
  const goldColor = '#F7A814';

  // Dimension presets
  const sizeConfig = {
    sm: {
      height: 36,
      iconSize: 34,
      textPrimary: 'text-lg',
      textSecondary: 'text-[10px]',
    },
    md: {
      height: 44,
      iconSize: 42,
      textPrimary: 'text-2xl',
      textSecondary: 'text-xs',
    },
    lg: {
      height: 56,
      iconSize: 54,
      textPrimary: 'text-3xl',
      textSecondary: 'text-sm',
    },
    xl: {
      height: 72,
      iconSize: 70,
      textPrimary: 'text-4xl',
      textSecondary: 'text-base',
    },
  };

  const current = sizeConfig[size];

  // SVG de l'emblème montagneux officiel
  const MountainIcon = ({ width = 50, height = 35 }: { width?: number; height?: number }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 1000 620"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-2xs"
    >
      {/* 1. Facette gauche dorée (Pointe haute élancée) */}
      <path
        d="M140 500 L445 145 L480 205 L395 285 L445 350 L335 435 L260 460 Z"
        fill={goldColor}
      />
      {/* Prolongement supérieur or de la crête */}
      <polygon
        points="445,145 480,205 385,285 330,225"
        fill={goldColor}
      />
      {/* Trait fin doré en amorce */}
      <path
        d="M140 500 L260 460 L180 505 Z"
        fill={goldColor}
      />

      {/* 2. Montagne principale bleu marine (#002855) */}
      {/* Face extérieure et crête */}
      <path
        d="M585 145 L805 490 L695 465 L585 260 L500 465 L465 305 L380 275 L335 435 L180 520 L330 430 L380 275 L465 305 L585 145 Z"
        fill={blueColor}
      />

      {/* Remplissage compact du grand pic avec ouverture intérieure */}
      <path
        d="M585 145 L805 490 L710 480 L585 270 L485 475 L465 305 Z"
        fill={blueColor}
      />

      {/* Crête intermédiaire bleu marine */}
      <polygon
        points="380,275 465,305 395,385 335,435"
        fill={blueColor}
      />

      {/* 3. Bande courbe inférieure dynamique (Swoosh de base) */}
      <path
        d="M115 590 C280 520 660 480 875 555 C660 520 300 545 115 590 Z"
        fill={blueColor}
      />
      <path
        d="M130 575 C310 505 680 475 875 555 C680 495 310 525 130 575 Z"
        fill={blueColor}
      />
    </svg>
  );

  // Variante 1: Format Empilé (Identique à l'image PNG officielle fournie)
  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
        <MountainIcon width={current.iconSize * 2.2} height={current.iconSize * 1.4} />
        <span
          className="font-black tracking-tight leading-none text-3xl sm:text-4xl mt-1.5 font-sans"
          style={{
            color: blueColor,
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            letterSpacing: '0.03em',
          }}
        >
          MLIMA
        </span>
        <span
          className="font-bold text-sm sm:text-base tracking-wide leading-none mt-1 font-sans"
          style={{ color: goldColor }}
        >
          Supplier
        </span>
      </div>
    );
  }

  // Variante 2: Icône seule
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <MountainIcon width={current.iconSize} height={(current.iconSize * 62) / 100} />
      </div>
    );
  }

  // Variante 3: Format Horizontal (Idéal pour la barre de navigation et le footer)
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Icône officielle de montagne */}
      <MountainIcon
        width={current.iconSize * 1.25}
        height={(current.iconSize * 1.25 * 62) / 100}
      />

      {/* Bloc texte fidèle avec MLIMA en bleu et Supplier en jaune */}
      <div className="flex flex-col justify-center leading-none">
        <span
          className={`font-black tracking-tight font-sans ${current.textPrimary}`}
          style={{
            color: blueColor,
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            letterSpacing: '0.04em',
            lineHeight: 0.95,
          }}
        >
          MLIMA
        </span>
        <span
          className={`font-bold tracking-normal font-sans ${current.textSecondary} mt-0.5`}
          style={{ color: goldColor, lineHeight: 1 }}
        >
          Supplier
        </span>
      </div>
    </div>
  );
};
