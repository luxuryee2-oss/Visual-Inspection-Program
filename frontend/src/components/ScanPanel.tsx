import {useCallback, useEffect, useRef, useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Camera, CameraOff, Scan} from 'lucide-react';
import {Html5Qrcode} from 'html5-qrcode';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onProductFound?: (productCode: string, productName: string) => void;
};

export function ScanPanel({value, onChange, onProductFound}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scanAreaRef = useRef<HTMLDivElement | null>(null);
  const qrCodeScannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopScanning = useCallback(async () => {
    if (qrCodeScannerRef.current) {
      try {
        await qrCodeScannerRef.current.stop();
        await qrCodeScannerRef.current.clear();
      } catch (err) {
        // 이미 정지된 경우 무시
      }
      qrCodeScannerRef.current = null;
    }
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }
    setCameraActive(false);
    setScanning(false);
  }, []);

  const startScanning = useCallback(async () => {
    try {
      setError(null);
      setScanning(true);
      
      if (!scanAreaRef.current) {
        setError('스캔 영역을 찾을 수 없습니다.');
        setScanning(false);
        return;
      }

      // 카메라 권한 확인
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('이 브라우저는 카메라를 지원하지 않습니다. HTTPS를 사용하거나 다른 브라우저를 시도하세요.');
        setScanning(false);
        return;
      }

      // HTTPS 확인 (로컬호스트 제외)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        setError('카메라는 HTTPS 연결에서만 사용할 수 있습니다.');
        setScanning(false);
        return;
      }

      const qrCode = new Html5Qrcode(scanAreaRef.current.id);
      qrCodeScannerRef.current = qrCode;

      await qrCode.start(
        {facingMode: 'environment'},
        {
          fps: 10,
          qrbox: {width: 250, height: 250}
        },
        (decodedText) => {
          // 스캔 성공
          onChange(decodedText);
          stopScanning();
          
          // 고유 코드 추출 (앞부분)
          const uniqueCode = decodedText.split('-')[0] || decodedText.split('_')[0] || decodedText.substring(0, 8);
          if (onProductFound && uniqueCode) {
            // 제품 정보 조회는 상위 컴포넌트에서 처리
            onProductFound(decodedText, uniqueCode);
          }
        },
        () => {
          // 스캔 실패 (계속 시도)
        }
      );
      
      setCameraActive(true);
    } catch (err: any) {
      console.error('스캔 시작 실패:', err);
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
      
      setError(errorMessage);
      setScanning(false);
      setCameraActive(false);
    }
  }, [onChange, onProductFound, stopScanning]);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      
      // 카메라 권한 확인
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('이 브라우저는 카메라를 지원하지 않습니다. HTTPS를 사용하거나 다른 브라우저를 시도하세요.');
        return;
      }

      // HTTPS 확인 (로컬호스트 제외)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        setError('카메라는 HTTPS 연결에서만 사용할 수 있습니다.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({video: {facingMode: 'environment'}});
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
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
      
      setError(errorMessage);
    }
  }, []);

  const stopCamera = useCallback(() => {
    stopScanning();
  }, [stopScanning]);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

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
            placeholder="제품 코드 입력 또는 스캔"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="border-input/50 focus-visible:ring-[hsl(var(--doom-red))]"
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={scanning ? "destructive" : "doom"}
            size="sm"
            onClick={scanning ? stopScanning : startScanning}
            className="flex-1"
          >
            {scanning ? (
              <>
                <CameraOff className="h-4 w-4 mr-2" />
                스캔 중지
              </>
            ) : (
              <>
                <Scan className="h-4 w-4 mr-2" />
                스캔 시작
              </>
            )}
          </Button>
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
                카메라
              </>
            )}
          </Button>
        </div>
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-md">
            <p className="text-sm text-destructive font-medium">{error}</p>
            <p className="text-xs text-muted-foreground mt-1">
              안드로이드: 설정 → 앱 → 브라우저 → 권한 → 카메라 허용
            </p>
          </div>
        )}
        {scanning && scanAreaRef.current && (
          <div
            id="qr-reader"
            ref={scanAreaRef}
            className="w-full rounded-md border border-[hsl(var(--doom-red))]/50"
            style={{minHeight: '300px'}}
          />
        )}
        {cameraActive && !scanning && (
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

