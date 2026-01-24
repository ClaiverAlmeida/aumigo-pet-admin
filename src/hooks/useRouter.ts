import { useState, useEffect } from 'react';
import { router } from '../utils/router';

// 🎣 HOOK PARA USAR O ROTEADOR
export function useRouter() {
  const [currentPath, setCurrentPath] = useState(router.getCurrentPath());

  useEffect(() => {
    const unsubscribe = router.addListener(() => {
      setCurrentPath(router.getCurrentPath());
    });

    return unsubscribe;
  }, []);

  return {
    currentPath,
    navigate: router.navigate.bind(router),
    isCurrentRoute: router.isCurrentRoute.bind(router),
    getCurrentRoute: router.getCurrentRoute.bind(router),
  };
}
