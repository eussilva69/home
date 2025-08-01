
'use client';

import { useState, useEffect } from 'react';

/**
 * A simple hook to determine if the component is being rendered on the client.
 * This is useful for avoiding hydration errors when dealing with browser-specific APIs.
 *
 * @returns {boolean} `true` if the component has mounted on the client, otherwise `false`.
 */
export function useClientOnly() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
