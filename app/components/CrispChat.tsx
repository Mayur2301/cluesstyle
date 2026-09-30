'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Crisp } from 'crisp-sdk-web';

const CRISP_WEBSITE_ID = '25836e3b-b4c7-4132-8da6-b900c9ce32c0';

let crispLoaded = false;

export default function CrispChat() {
  const pathname = usePathname();

  useEffect(() => {
    // Block on customized t-shirt page
    if (pathname === '/customized-your-t-shirt') {
      if (crispLoaded) {
        Crisp.chat.hide();
      }
      return;
    }

    // Load Crisp only once
    if (!crispLoaded) {
      Crisp.configure(CRISP_WEBSITE_ID);
      crispLoaded = true;
    }

    // Show when navigating back
    Crisp.chat.show();
  }, [pathname]);

  return null;
}