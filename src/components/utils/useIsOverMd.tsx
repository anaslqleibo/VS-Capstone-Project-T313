import { useEffect, useState } from 'react';

export default function useIsOverMd() {
  const [isOverMd, setIsOverMd] = useState(() =>
    window.matchMedia('(min-width: 768px)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleChange = () => setIsOverMd(mediaQuery.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isOverMd;
}
