import React, { useEffect, useState } from 'react';
import { useIsFetching } from '@tanstack/react-query';

export function TopProgressBar({ isNavigating = false }) {
  // Only consider fresh queries that don't have cached data yet (foreground data loading)
  const isFetchingFreshData = useIsFetching({
    predicate: (query) => query.state.status === 'pending' && !query.state.data,
  }) > 0;

  const isActive = isNavigating || isFetchingFreshData;
  const [visible, setVisible] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let timeoutId;
    if (isActive) {
      setIsFinished(false);
      setVisible(true);
    } else if (visible && !isActive) {
      setIsFinished(true);
      timeoutId = setTimeout(() => {
        setVisible(false);
        setIsFinished(false);
      }, 220);
    }
    return () => clearTimeout(timeoutId);
  }, [isActive, visible]);

  if (!visible) return null;

  return (
    <div
      role="progressbar"
      aria-label="Sahifa yuklanmoqda"
      className="fixed top-0 left-0 right-0 z-50 h-[2.5px] pointer-events-none overflow-hidden bg-bronze/10"
    >
      <div
        className={`h-full bg-gradient-to-r from-bronze-400 via-bronze to-bronze-600 transition-all ${
          isFinished
            ? 'w-full opacity-0 duration-ui'
            : 'w-2/3 opacity-100 duration-500 ease-out'
        }`}
      />
    </div>
  );
}

export default TopProgressBar;
