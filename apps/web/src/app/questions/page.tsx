import MainPage from '@/components/MainPage';
import { getGreetingConfig } from '@/lib/server-utils';

export default async function QuestionsPage() {
  const greetingConfig = await getGreetingConfig();
  return <MainPage initialTab="面试题库" serverGreetingConfig={greetingConfig} />;
}
