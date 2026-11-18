import React, { useState, useEffect, useCallback } from 'react';
import { NaturalLanguageLogger } from '../components/activities/NaturalLanguageLogger';
import { ActivityHistoryTable } from '../components/activities/ActivityHistoryTable';
import { activityService } from '../services/activityService';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const ActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await activityService.getActivities({ page: p, limit: 10 });
      if (res.success) {
        setActivities(res.activities);
        setTotal(res.total);
        setPage(res.page);
        setPages(res.pages);
      }
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities(page);
  }, [fetchActivities, page]);

  const handleActivityLogged = () => {
    fetchActivities(1);
  };

  const handleDeleteSuccess = () => {
    fetchActivities(page);
  };

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-300">
      {/* AI Natural Language Logger */}
      <NaturalLanguageLogger onActivityLogged={handleActivityLogged} />

      {/* Historical Activity Logs Table */}
      {loading && activities.length === 0 ? (
        <LoadingSkeleton type="table" count={5} />
      ) : (
        <ActivityHistoryTable
          activities={activities}
          total={total}
          page={page}
          pages={pages}
          onPageChange={(newPage) => setPage(newPage)}
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
};
