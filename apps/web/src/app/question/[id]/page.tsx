import MainPage from '@/components/MainPage';

export default async function QuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MainPage initialTab="面试题库" initialQuestionId={id} />;
}
