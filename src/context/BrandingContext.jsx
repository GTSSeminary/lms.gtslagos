import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const BrandingContext = createContext({
  schoolName: 'GTS Seminary',
  shortName: 'GTS',
  logoUrl: null,
  loading: true,
});

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState({
    schoolName: 'GTS Seminary',
    shortName: 'GTS',
    logoUrl: null,
    loading: true,
  });

  useEffect(() => {
    let active = true;
    api
      .get('/api/settings/public', { auth: false })
      .then((data) => {
        if (!active) return;
        setBranding({
          schoolName: data.school_name || 'GTS Seminary',
          shortName: data.short_name || 'GTS',
          logoUrl: data.logo_url || null,
          email: data.school_email || null,
          loading: false,
        });
      })
      .catch(() => {
        if (!active) return;
        setBranding((b) => ({ ...b, loading: false }));
      });
    return () => {
      active = false;
    };
  }, []);

  return <BrandingContext.Provider value={branding}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  return useContext(BrandingContext);
}
