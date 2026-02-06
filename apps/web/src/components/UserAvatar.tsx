import React, { useMemo } from 'react';

interface UserAvatarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  onClick?: () => void;
}

// Curated gradients matching the project's Warm/Earthy/Brown theme
const AVATAR_GRADIENTS = [
  'bg-gradient-to-br from-primary-800 to-primary-600',   // Classic Brown
  'bg-gradient-to-br from-primary-900 to-accent-copper', // Dark Copper
  'bg-gradient-to-br from-primary-800 to-accent-gold',   // Dark Gold
  'bg-gradient-to-br from-primary-700 to-accent-sage',   // Earthy Green
  'bg-gradient-to-br from-primary-700 to-accent-blue',   // Muted Blue
  'bg-gradient-to-br from-neutral-dark to-neutral-medium', // Warm Gray
  'bg-gradient-to-br from-primary-600 to-accent-copper', // Lighter Copper
  'bg-gradient-to-br from-primary-600 to-accent-sage',   // Lighter Sage
];

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm', // Slightly larger text for readability
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-4xl',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = 'md', 
  className = '',
  onClick 
}) => {
  // Deterministic gradient selection
  const gradientClass = useMemo(() => {
    const identifier = user?.email || user?.name || 'default';
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
    return AVATAR_GRADIENTS[index];
  }, [user?.email, user?.name]);

  const initial = useMemo(() => {
    if (!user) return null;
    if (user.name) return user.name.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  }, [user]);

  const sizeClass = SIZE_CLASSES[size];

  // Render minimal placeholder for non-logged-in users
  if (!user) {
    return (
      <div 
        onClick={onClick}
        className={`
          ${sizeClass} 
          rounded-full 
          flex items-center justify-center 
          shadow-sm
          overflow-hidden
          relative
          transition-all duration-200
          bg-primary-50 text-primary-300
          hover:bg-primary-100 hover:text-primary-400
          ${className}
        `}
      >
        <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/5 pointer-events-none z-20" />
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[60%] h-[60%]">
          <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`
        ${sizeClass} 
        rounded-full 
        flex items-center justify-center 
        font-bold text-white shadow-md 
        overflow-hidden
        relative
        transition-all duration-200
        ${className}
        ${!user?.image ? gradientClass : 'bg-neutral-light'}
      `}
    >
      {/* Border Overlay - fixes white background leak by using inset ring instead of border */}
      <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/5 dark:ring-white/10 pointer-events-none z-20" />

      {user?.image ? (
        <img 
          src={user.image} 
          alt={user.name || "User"} 
          className="w-full h-full object-cover" 
        />
      ) : (
        <>
          {/* Subtle noise texture for realism */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
            }} 
          />
          
          {/* Inner shadow for depth */}
          <div className="absolute inset-0 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.1)] pointer-events-none" />

          {/* Initial */}
          <span className="relative z-10 drop-shadow-sm select-none font-sans tracking-tight">
            {initial}
          </span>
        </>
      )}
    </div>
  );
};
