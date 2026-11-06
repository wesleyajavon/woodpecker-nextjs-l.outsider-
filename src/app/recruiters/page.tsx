import { notFound } from 'next/navigation';
import RecruitersContent from './RecruitersContent';

const RECRUITERS_PAGE_VISIBLE = false;

export default function RecruitersPage() {
  if (!RECRUITERS_PAGE_VISIBLE) {
    notFound();
  }

  return <RecruitersContent />;
}
