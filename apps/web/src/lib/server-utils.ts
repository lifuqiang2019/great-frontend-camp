export async function getGreetingConfig() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/system/config`, {
      next: { revalidate: 60 } // Revalidate every minute
    });
    if (!res.ok) return {};
    const data = await res.json();
    return data.reduce((acc: any, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
  } catch (error) {
    console.error('Failed to fetch greeting config:', error);
    return {};
  }
}
