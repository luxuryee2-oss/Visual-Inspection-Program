import type {InspectionHistoryEntry} from '../types/inspection';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {ExternalLink, Loader2} from 'lucide-react';

type Props = {
  entries: InspectionHistoryEntry[];
  loading: boolean;
};

export function InspectionHistory({entries, loading}: Props) {
  return (
    <Card className="border-[hsl(var(--doom-red))]/30 h-fit max-h-[calc(100vh-200px)] overflow-hidden flex flex-col">
      <CardHeader>
        <CardTitle className="text-[hsl(var(--doom-red))]">최근 업로드</CardTitle>
        <CardDescription>제품 코드별 검사 이력</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {!loading && entries.length === 0 && (
          <p className="text-center text-muted-foreground py-8">제품 코드로 조회한 기록이 없습니다.</p>
        )}
        <div className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry.InspectionId} className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{entry.ModelName ?? '모델 미상'}</CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.CapturedAt ?? '').toLocaleString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">
                  <span className="text-muted-foreground">검사자:</span> {entry.InspectedBy ?? '-'}
                </p>
                {entry.Notes && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">메모:</span> {entry.Notes}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 pt-2">
                  {['FrontUrl', 'BackUrl', 'LeftUrl', 'RightUrl'].map((key) => {
                    const url = (entry as any)[key];
                    if (!url) return null;
                    return (
                      <Button
                        key={key}
                        variant="outline"
                        size="sm"
                        asChild
                        className="text-xs"
                      >
                        <a href={url} target="_blank" rel="noreferrer">
                          {key.replace('Url', '')}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

