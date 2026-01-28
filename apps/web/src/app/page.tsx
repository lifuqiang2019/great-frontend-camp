import MainPage from '@/components/MainPage';
import { getGreetingConfig } from '@/lib/server-utils';

export default async function HomePage() {
  const greetingConfig = await getGreetingConfig();
  return <MainPage serverGreetingConfig={greetingConfig} />;
}
