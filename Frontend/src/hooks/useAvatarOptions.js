import { useMemo } from 'react';

export function useResolveAvatarUrl(profilePic) {
  return useMemo(() => {
    if (!profilePic || typeof profilePic !== 'number') return '';
    
    // Dynamically load avatars from assets/profile
    try {
      const avatarContext = require.context('../assets/profile', false, /\.(png|jpe?g|webp)$/);
      const avatarOptions = avatarContext
        .keys()
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((key) => {
          const moduleValue = avatarContext(key);
          return moduleValue?.default || moduleValue;
        });

      const numericPic = Number(profilePic);
      if (!Number.isInteger(numericPic) || numericPic < 1 || numericPic > avatarOptions.length) {
        return '';
      }

      return avatarOptions[numericPic - 1] || '';
    } catch (error) {
      console.error('[useResolveAvatarUrl] Error loading avatars:', error);
      return '';
    }
  }, [profilePic]);
}
