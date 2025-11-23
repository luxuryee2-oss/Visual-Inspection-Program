import type {InspectionDirection} from '../types/inspection';
import {Card, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {X, Upload} from 'lucide-react';
import {cn} from '@/lib/utils';

const labels: Record<InspectionDirection, string> = {
  front: '정면',
  back: '후면',
  left: '좌측',
  right: '우측'
};

type Props = {
  value: File | null;
  direction: InspectionDirection;
  onChange: (file: File | null) => void;
};

export function ImageUploader({direction, value, onChange}: Props) {
  const preview = value ? URL.createObjectURL(value) : null;

  return (
    <Card className={cn(
      "border-[hsl(var(--doom-red))]/30 overflow-hidden transition-all",
      preview && "ring-2 ring-[hsl(var(--doom-red))]/50"
    )}>
      <CardContent className="p-0">
        <div className="relative aspect-square">
          <label className="flex h-full w-full cursor-pointer items-center justify-center bg-muted/50 hover:bg-muted/80 transition-colors">
            {preview ? (
              <div className="relative h-full w-full group">
                <img
                  src={preview}
                  alt={`${labels[direction]} 미리보기`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      onChange(null);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    삭제
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="h-8 w-8" />
                <span className="text-sm font-medium">{labels[direction]}</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(event) => onChange(event.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>
        </div>
        <div className="p-2 bg-card border-t border-border">
          <p className="text-xs text-center text-muted-foreground font-medium">{labels[direction]}</p>
        </div>
      </CardContent>
    </Card>
  );
}

