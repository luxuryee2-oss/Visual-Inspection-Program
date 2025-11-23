import {useCallback, useEffect, useRef, useState} from 'react';

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
    <div className="scan-panel">
      <div className="panel-header">
        <h2>제품 스캔</h2>
        <button type="button" onClick={cameraActive ? stopCamera : startCamera} className="secondary">
          {cameraActive ? '카메라 종료' : '카메라 스캔'}
        </button>
      </div>
      <p>바코드 스캐너 또는 수동 입력으로 제품 코드를 채워주세요.</p>
      <input
        type="text"
        placeholder="제품 코드 입력"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      {cameraActive && <video ref={videoRef} className="scan-video" muted />}
    </div>
  );
}

