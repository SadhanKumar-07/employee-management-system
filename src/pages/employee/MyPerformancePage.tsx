import { useEffect, useState } from 'react';
import { performanceApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { PerformanceRating } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Star } from 'lucide-react';

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(i => (
      <Star key={i} className={`w-5 h-5 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
    ))}
  </div>
);

const MyPerformancePage = () => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<PerformanceRating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.employee_id) return;
    performanceApi.getByEmployee(user.employee_id).then(data => {
      setRatings(data.sort((a, b) => b.date.localeCompare(a.date)));
      setLoading(false);
    });
  }, [user]);

  const avg = ratings.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : null;

  return (
    <div className="space-y-6">
      <PageHeader title="My Performance" description="Performance ratings and feedback from your Project Manager" />

      {avg !== null && (
        <div className="rounded-xl border border-border bg-card shadow-card p-6">
          <div className="flex items-center gap-6">
            <div className="text-5xl font-bold text-primary">{avg.toFixed(1)}</div>
            <div>
              <StarRating rating={Math.round(avg)} />
              <p className="text-sm text-muted-foreground mt-1">Overall average from {ratings.length} review{ratings.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : ratings.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-border bg-card">
          <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-card-foreground">No reviews yet</p>
          <p className="text-sm text-muted-foreground">Your Project Manager will rate your performance here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ratings.map(r => (
            <div key={r.rating_id} className="rounded-xl border border-border bg-card shadow-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <StarRating rating={r.rating} />
                    <span className="font-semibold text-2xl text-primary">{r.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-sm font-medium text-card-foreground">Project: {r.project_name}</p>
                  <p className="text-sm text-muted-foreground">Rated by: {r.rated_by_name}</p>
                  {r.comments && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-card-foreground italic">"{r.comments}"</p>
                    </div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground shrink-0">{r.date}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPerformancePage;
