import {useCallback, useEffect, useRef, useState} from 'react';
import type {InspectionDirection} from '../types/inspection';
import {Card, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {X, Upload, Camera, CameraOff} from 'lucide-react';
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const preview = value ? URL.createObjectURL(value) : null;

  const startCamera = useCallback(async () => {
    try {
      // 카메라 권한 확인
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('이 브라우저는 카메라를 지원하지 않습니다. HTTPS를 사용하거나 다른 브라우저를 시도하세요.');
        return;
      }

      // HTTPS 확인 (로컬호스트 제외)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        alert('카메라는 HTTPS 연결에서만 사용할 수 있습니다.');
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {facingMode: 'environment'}
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error('카메라 시작 실패:', err);
      let errorMessage = '카메라를 사용할 수 없습니다.';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = '카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = '카메라를 찾을 수 없습니다.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = '카메라에 접근할 수 없습니다. 다른 앱에서 사용 중일 수 있습니다.';
      } else if (err.message) {
        errorMessage = `카메라 오류: ${err.message}`;
      }
      
      alert(errorMessage);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${direction}-${Date.now()}.jpg`, {type: 'image/jpeg'});
        onChange(file);
        stopCamera();
      }
    }, 'image/jpeg', 0.9);
  }, [direction, onChange, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [stopCamera, preview]);

  return (
    <Card className={cn(
      "border-[hsl(var(--doom-red))]/30 overflow-hidden transition-all",
      preview && "ring-2 ring-[hsl(var(--doom-red))]/50"
    )}>
      <CardContent className="p-0">
        <div className="relative aspect-square">
          {cameraActive ? (
            <div className="relative h-full w-full">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                autoPlay
                playsInline
                muted
              />
              <div className="absolute inset-0 flex items-end justify-center gap-2 p-4 bg-gradient-to-t from-black/70 to-transparent">
                <Button
                  type="button"
                  variant="doom"
                  size="lg"
                  onClick={capturePhoto}
                  className="flex-1"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  촬영
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="lg"
                  onClick={stopCamera}
                >
                  <CameraOff className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ) : preview ? (
            <div className="relative h-full w-full group">
              <img
                src={preview}
                alt={`${labels[direction]} 미리보기`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="doom"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    startCamera();
                  }}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  재촬영
                </Button>
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
            <div className="flex flex-col h-full items-center justify-center gap-3 bg-muted/50 hover:bg-muted/80 transition-colors p-4">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="h-8 w-8" />
                <span className="text-sm font-medium">{labels[direction]}</span>
              </div>
              <div className="flex gap-2 w-full">
                <Button
                  type="button"
                  variant="doom"
                  size="sm"
                  onClick={startCamera}
                  className="flex-1"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  촬영
                </Button>
                <label className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <span>파일 선택</span>
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => onChange(event.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
        <div className="p-2 bg-card border-t border-border">
          <p className="text-xs text-center text-muted-foreground font-medium">{labels[direction]}</p>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}

