import MainPage from '@/components/MainPage';
import { getGreetingConfig } from '@/lib/server-utils';

export default async function CampPage() {
  const greetingConfig = await getGreetingConfig();
  return <MainPage initialTab="同学营活动" serverGreetingConfig={greetingConfig} />;
}
