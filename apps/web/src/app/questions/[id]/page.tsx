import MainPage from '@/components/MainPage';
import { getGreetingConfig } from '@/lib/server-utils';

export default async function QuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const greetingConfig = await getGreetingConfig();
  return <MainPage initialTab="面试题库" initialQuestionId={id} serverGreetingConfig={greetingConfig} />;
}
