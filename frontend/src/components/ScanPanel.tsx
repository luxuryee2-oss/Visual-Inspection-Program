import {useCallback, useEffect, useRef, useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Camera, CameraOff} from 'lucide-react';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function ScanPanel({value, onChange}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({video: {facingMode: 'environment'}});
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      setError('카메라를 사용할 수 없습니다. 권한을 확인하세요.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <Card className="border-[hsl(var(--doom-red))]/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">제품 스캔</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={cameraActive ? stopCamera : startCamera}
          >
            {cameraActive ? (
              <>
                <CameraOff className="h-4 w-4 mr-2" />
                종료
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                스캔
              </>
            )}
          </Button>
        </div>
        <CardDescription>바코드 스캐너 또는 수동 입력으로 제품 코드를 채워주세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="productCode">제품 코드</Label>
          <Input
            id="productCode"
            type="text"
            placeholder="제품 코드 입력"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="border-input/50 focus-visible:ring-[hsl(var(--doom-red))]"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {cameraActive && (
          <video
            ref={videoRef}
            className="w-full rounded-md border border-input/50"
            muted
            playsInline
          />
        )}
      </CardContent>
    </Card>
  );
}

