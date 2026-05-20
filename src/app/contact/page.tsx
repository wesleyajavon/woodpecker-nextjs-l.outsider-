'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { ContactCard } from '@/components/ui/contact-card';
import { HomeBackground } from '@/components/home/HomeBackground';
import { Button } from '@/components/ui/Button';
import {
  catalogInputClass,
  catalogSelectClass,
} from '@/components/catalog/catalog-styles';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';

const textareaClass = cn(
  catalogInputClass,
  'min-h-[140px] resize-none py-3',
);

const ContactPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || t('contact.form.error'));
      }
    } catch {
      setSubmitStatus('error');
      setErrorMessage(t('errors.network'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    {
      icon: Mail,
      label: t('contact.info.email'),
      value: 'contact.loutsider@gmail.com',
    },
    {
      icon: Phone,
      label: t('common.phone'),
      value: '+32 471 51 20 44',
    },
    {
      icon: MapPin,
      label: t('contact.info.location'),
      value: 'Belgique',
    },
    {
      icon: Clock,
      label: t('contact.info.response'),
      value: t('contact.info.responseTime'),
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-background pb-16 pt-20">
      <HomeBackground />

      <div className="container relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 border-b border-white/6 pb-8 sm:mb-12"
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {t('nav.contact')}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t('contact.title')}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t('contact.subtitle')}
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <ContactCard contactInfo={contactInfo}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">
                    {t('contact.form.name')} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={catalogInputClass}
                    placeholder={t('contact.form.namePlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    {t('contact.form.email')} *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={catalogInputClass}
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-foreground">
                  {t('contact.form.subject')} *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className={catalogSelectClass}
                >
                  <option value="" className="bg-[#0a0a0a]">
                    {t('contact.form.selectSubject')}
                  </option>
                  <option value="support" className="bg-[#0a0a0a]">
                    {t('contact.form.subjects.support')}
                  </option>
                  <option value="sales" className="bg-[#0a0a0a]">
                    {t('contact.form.subjects.sales')}
                  </option>
                  <option value="partnership" className="bg-[#0a0a0a]">
                    {t('contact.form.subjects.partnership')}
                  </option>
                  <option value="other" className="bg-[#0a0a0a]">
                    {t('contact.form.subjects.other')}
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-foreground">
                  {t('contact.form.message')} *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className={textareaClass}
                  placeholder={t('contact.form.messagePlaceholder')}
                />
              </div>

              {submitStatus === 'success' && (
                <div
                  role="status"
                  className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-200"
                >
                  {t('contact.form.success')}
                </div>
              )}

              {submitStatus === 'error' && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300"
                >
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full rounded-lg bg-white text-sm font-medium text-black hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[200px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('contact.form.sending')}
                  </>
                ) : (
                  <>
                    {t('contact.form.send')}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </ContactCard>
        </motion.div>
      </div>
    </main>
  );
};

export default ContactPage;
