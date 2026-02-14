"use client";

import { useMemo, useState } from "react";

type ActivityCell = {
  dateKey: string;
  count: number;
};

type ActivityMonthLabel = {
  month: string;
  column: number;
};

type ActivityYearData = {
  year: number;
  cells: ActivityCell[];
  monthLabels: ActivityMonthLabel[];
};

type ActivityHistorySectionProps = {
  years: ActivityYearData[];
};

function getActivityLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) {
    return 0;
  }

  if (count === 1) {
    return 1;
  }

  if (count === 2) {
    return 2;
  }

  if (count <= 4) {
    return 3;
  }

  return 4;
}

export function ActivityHistorySection({ years }: ActivityHistorySectionProps) {
  const [selectedYear, setSelectedYear] = useState(years[0]?.year ?? new Date().getFullYear());

  const selectedData = useMemo(() => {
    return years.find((year) => year.year === selectedYear) ?? years[0];
  }, [selectedYear, years]);

  const activeDaysCount = selectedData?.cells.filter((cell) => cell.count > 0).length ?? 0;
  const yearActivities = selectedData?.cells.reduce((sum, cell) => sum + cell.count, 0) ?? 0;

  return (
    <section className="overview-section" aria-label="posting activity">
      <div className="overview-section-head activity-head-with-toggle">
        <h2>Activities</h2>
        <div className="activity-year-toggle" role="tablist" aria-label="활동 이력 연도 선택">
          {years.map((year) => {
            const isSelected = year.year === selectedYear;

            return (
              <button
                key={year.year}
                type="button"
                className={isSelected ? "active" : ""}
                onClick={() => setSelectedYear(year.year)}
                role="tab"
                aria-selected={isSelected}
                aria-controls={`activity-panel-${year.year}`}
                id={`activity-tab-${year.year}`}
              >
                {year.year}
              </button>
            );
          })}
        </div>
      </div>
      <p className="activity-summary-text">{selectedYear}년 · 활동일 {activeDaysCount}일</p>
      <div className="activity-history-wrap" id={`activity-panel-${selectedYear}`} role="tabpanel" aria-labelledby={`activity-tab-${selectedYear}`}>
        <div className="activity-month-labels" aria-hidden="true">
          {selectedData?.monthLabels.map((label) => (
            <span key={`${selectedYear}-${label.month}`} style={{ gridColumn: `${label.column + 1}` }}>
              {label.month}
            </span>
          ))}
        </div>
        <div className="activity-history-grid" role="img" aria-label={`${selectedYear}년 게시글 업로드 활동 이력`}>
          {selectedData?.cells.map((cell) => {
            const level = getActivityLevel(cell.count);

            return <span key={cell.dateKey} className={`activity-cell level-${level}`} title={`${cell.dateKey} · ${cell.count} activities`} />;
          })}
        </div>
        <div className="activity-history-footer">
          <span>{yearActivities} activities in {selectedYear}</span>
          <div className="activity-legend" aria-label="활동 강도 색상 단계">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <span key={level} className={`activity-cell level-${level}`} aria-hidden="true" />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </section>
  );
}
