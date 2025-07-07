import { redirect } from 'next/navigation';
import { checkAuth } from '@/lib/auth/utils';

export default async function EventsPage() {
  await checkAuth();

  // Redirect to hosting events by default
  // Users can navigate to other sections via the sidebar
  redirect('/events/hosting');
}
