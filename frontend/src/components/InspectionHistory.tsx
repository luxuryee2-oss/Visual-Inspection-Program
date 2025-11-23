import type {InspectionHistoryEntry} from '../types/inspection';

type Props = {
  entries: InspectionHistoryEntry[];
  loading: boolean;
};

export function InspectionHistory({entries, loading}: Props) {
  return (
    <section className="history-section">
      <h2>최근 업로드</h2>
      {loading && <p>조회 중...</p>}
      {!loading && entries.length === 0 && <p>제품 코드로 조회한 기록이 없습니다.</p>}
      <div className="history-grid">
        {entries.map((entry) => (
          <article key={entry.InspectionId} className="history-card">
            <header>
              <h3>{entry.ModelName ?? '모델 미상'}</h3>
              <span>{new Date(entry.CapturedAt ?? '').toLocaleString()}</span>
            </header>
            <p>검사자: {entry.InspectedBy ?? '-'}</p>
            <p>메모: {entry.Notes ?? '-'}</p>
            <div className="history-images">
              {['FrontUrl', 'BackUrl', 'LeftUrl', 'RightUrl'].map((key) => {
                const url = (entry as any)[key];
                if (!url) return null;
                return (
                  <a key={key} href={url} target="_blank" rel="noreferrer">
                    {key.replace('Url', '')}
                  </a>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

