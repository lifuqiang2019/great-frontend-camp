export async function getGreetingConfig() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/system/config`, {
      next: { revalidate: 60 } // Revalidate every minute
    });
    if (!res.ok) return {};
    const json = await res.json();
    
    // Check if response is wrapped in standard format { code, message, data }
    const data = Array.isArray(json) ? json : (json.data || []);
    
    if (!Array.isArray(data)) return {};

    return data.reduce((acc: any, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
  } catch (error) {
    console.error('Failed to fetch greeting config:', error);
    return {};
  }
}

export async function getQuestions() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions`, {
      cache: 'no-store' // Always fetch fresh data for now, or use revalidate
    });
    if (!res.ok) return [];
    const json = await res.json();
    // Handle standard response format { code, message, data }
    return Array.isArray(json) ? json : (json.data || []);
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    return [];
  }
}

export async function getCategories() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/categories`, {
      cache: 'no-store'
    });
    if (!res.ok) return [];
    const json = await res.json();
    // Handle standard response format { code, message, data }
    return Array.isArray(json) ? json : (json.data || []);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}
