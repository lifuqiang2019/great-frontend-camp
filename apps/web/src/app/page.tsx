import MainPage from '@/components/MainPage';
import { getGreetingConfig, getQuestions, getCategories } from '@/lib/server-utils';

export default async function HomePage() {
  const greetingConfig = await getGreetingConfig();
  const questions = await getQuestions();
  const categories = await getCategories();

  return (
    <MainPage 
      serverGreetingConfig={greetingConfig} 
      initialQuestions={questions}
      initialCategories={categories}
    />
  );
}
