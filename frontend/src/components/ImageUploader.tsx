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
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {facingMode: 'environment'}
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      alert('카메라를 사용할 수 없습니다. 권한을 확인하세요.');
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

