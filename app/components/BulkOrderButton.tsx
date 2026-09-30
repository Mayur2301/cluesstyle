// components/BulkOrderButton.tsx
'use client';

import { useState } from 'react';
import BulkOrderModal from '@/app/components/Bulkordermodal';

export default function BulkOrderButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="rounded-[25px] border border-black px-6 py-3 font-semibold transition bg-black text-white font-medium transition hover:bg-gray-800"
        onClick={() => setOpen(true)}
      >
        Bulk Orders
      </button>

      <BulkOrderModal
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}