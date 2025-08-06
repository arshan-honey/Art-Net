import { useState, useEffect } from 'react';

interface HomeArtwork {
  id: string;
  title: string;
  artist: string;
  category: string;
  image: string;
  likes: number;
  views: number;
  comments: number;
  slug: string;
}

interface HomeCategory {
  name: string;
  count: number;
  icon: string;
  slug: string;
}

interface HomeStat {
  label: string;
  value: number;
  icon: string;
}

interface HomeData {
  featuredArtworks: HomeArtwork[];
  categories: HomeCategory[];
  stats: HomeStat[];
}

export function useHomeData() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/home');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const homeData = await response.json();
        setData(homeData);
      } catch (err) {
        console.error('Error fetching home data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return { data, loading, error };
}
