import { useState, useEffect } from 'react';

interface DailyPrompt {
  type: string;
  text: string;
  author: string;
  id: string;
}

interface DailyContent {
  date: string;
  primary: DailyPrompt;
  secondary: DailyPrompt[];
}

export function useDailyContent() {
  const [content, setContent] = useState<DailyContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchDailyContent() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/prompts/today');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || 'Failed to fetch daily content');
        }
        const data = await response.json();
        setContent(data.content);
      } catch (e) {
        setError(e as Error);
        console.error("Error fetching daily content:", e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDailyContent();
  }, []);

  return { content, isLoading, error };
} 