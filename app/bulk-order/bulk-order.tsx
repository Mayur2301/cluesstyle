'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import BulkOrderHero from '../components/BulkOrderHero';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  name: string;
  mobile: string;
  email: string;
  requirement: string;
}

interface FormErrors {
  name?: string;
  mobile?: string;
}

// ─── Hero / Form Section ──────────────────────────────────────────────────────

export default function BulkOrderPage() {
  const [form, setForm] = useState<FormData>({
    name: '',
    mobile: '',
    email: '',
    requirement: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const mobileRef = useRef<HTMLInputElement>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.mobile.trim()) {
      newErrors.mobile = 'Mobile is required';
    } else if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // clear error on type
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // ── Replace with your real API endpoint ──
      // await fetch('/api/bulk-order', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(form),
      // });
      await new Promise((r) => setTimeout(r, 1400)); // simulate network
      setSubmitted(true);
    } catch (err) {
      console.error('Bulk order submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    

    <>
      <BulkOrderHero />
    </>
    
  );
}