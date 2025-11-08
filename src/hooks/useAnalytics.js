import { useQuery } from '@tanstack/react-query';

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch analytics');
      }
      
      return data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
