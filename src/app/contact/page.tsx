'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { ContactCard } from '@/components/ui/contact-card';
import { DottedSurface } from '@/components/ui/dotted-surface';
import { TextRewind } from '@/components/ui/text-rewind';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';

const ContactPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: Mail,
      label: t('contact.info.email'),
      value: 'contact.loutsider@gmail.com'
    },
    {
      icon: Phone,
      label: t('common.phone'),
      value: '+32 471 51 20 44'
    },
    {
      icon: MapPin,
      label: t('contact.info.location'),
      value: 'Belgique'
    },
    {
      icon: Clock,
      label: t('contact.info.response'),
      value: t('contact.info.responseTime')
    }
  ];

  return (
    <main className="min-h-screen bg-background pt-16 sm:pt-20 pb-8 sm:pb-12">
      <DottedSurface className="size-full z-0" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute -top-10 left-1/2 size-full -translate-x-1/2 rounded-full',
            'bg-[radial-gradient(ellipse_at_center,var(--theme-gradient),transparent_50%)]',
            'blur-[30px]',
          )}
        />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-12 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12 px-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 mt-6"
          >
            <TextRewind text={t('contact.title')} />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            {t('contact.subtitle')}
          </motion.p>
        </div>

        <ContactCard
          contactInfo={contactInfo}
          className="shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  {t('contact.form.name')} *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-border text-foreground rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors placeholder-muted-foreground text-sm sm:text-base touch-manipulation"
                  placeholder={t('contact.form.namePlaceholder')}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  {t('contact.form.email')} *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-border text-foreground rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors placeholder-muted-foreground text-sm sm:text-base touch-manipulation"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                {t('contact.form.subject')} *
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-border text-foreground rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base touch-manipulation"
              >
                <option value="">{t('contact.form.selectSubject')}</option>
                <option value="support">{t('contact.form.subjects.support')}</option>
                <option value="sales">{t('contact.form.subjects.sales')}</option>
                <option value="partnership">{t('contact.form.subjects.partnership')}</option>
                <option value="other">{t('contact.form.subjects.other')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                {t('contact.form.message')} *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-border text-foreground rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none placeholder-muted-foreground text-sm sm:text-base touch-manipulation"
                placeholder={t('contact.form.messagePlaceholder')}
              />
            </div>

            {/* Messages de statut */}
            {submitStatus === 'success' && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm">
                {t('contact.form.success')}
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm">
                ❌ {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation",
                isSubmitting
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600  hover:to-purple-600 text-white transform hover:scale-105"
              )}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-current"></div>
                  <span className="text-xs sm:text-sm">{t('contact.form.sending')}</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm">{t('contact.form.send')}</span>
                </>
              )}
            </button>
          </form>
        </ContactCard>
      </div>
    </main>
  );
};

export default ContactPage;
