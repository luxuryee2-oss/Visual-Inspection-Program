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

// 인터넷 익스플로러 감지
const isIE = () => {
  if (typeof window === 'undefined') return false;
  try {
    const ua = window.navigator?.userAgent || '';
    const msie = ua.indexOf('MSIE ');
    const trident = ua.indexOf('Trident/');
    return msie > 0 || trident > 0;
  } catch {
    return false;
  }
};

// 카메라 지원 여부 확인
const isCameraSupported = () => {
  if (typeof window === 'undefined') return false;
  if (isIE()) return false;
  try {
    return !!(navigator?.mediaDevices && navigator.mediaDevices.getUserMedia);
  } catch {
    return false;
  }
};

export function ImageUploader({direction, value, onChange}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [cameraSupported, setCameraSupported] = useState(false);
  
  // 컴포넌트 마운트 시 카메라 지원 여부 확인
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window !== 'undefined') {
      const supported = isCameraSupported();
      console.log('카메라 지원 여부 확인:', supported);
      setCameraSupported(supported);
    }
  }, []);
  
  // 이미지 미리보기 URL 생성 및 정리
  useEffect(() => {
    // 이전 URL 정리
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    
    // 새 URL 생성
    if (value) {
      previewUrlRef.current = URL.createObjectURL(value);
    }
    
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, [value]);
  
  const preview = previewUrlRef.current;

  // 크롬 환경에서 사용자 제스처와 직접 연결되도록 인라인 핸들러 사용
  const handleStartCamera = useCallback(async (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('=== handleStartCamera 호출됨 ===');
    console.log('현재 cameraActive 상태:', cameraActive);
    
    // 이미 카메라가 활성화되어 있으면 무시
    if (cameraActive) {
      console.log('카메라가 이미 활성화되어 있습니다');
      return;
    }
    
    try {
      console.log('=== 카메라 시작 시도 ===');
      console.log('비디오 요소 존재:', !!videoRef.current);
      console.log('카메라 지원 여부:', cameraSupported);
      
      // 카메라 권한 확인
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('getUserMedia를 지원하지 않습니다');
        alert('이 브라우저는 카메라를 지원하지 않습니다. HTTPS를 사용하거나 다른 브라우저를 시도하세요.');
        return;
      }

      // HTTPS 확인 (로컬호스트 제외)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        console.error('HTTPS가 아닙니다:', window.location.protocol);
        alert('카메라는 HTTPS 연결에서만 사용할 수 있습니다.');
        return;
      }

      // 크롬 브라우저 호환성을 위한 카메라 옵션
      // 다른 곳에서 카메라를 사용 중일 수 있으므로, 더 관대한 옵션 사용
      let constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' }, // 후면 카메라 우선 (ideal로 변경)
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      console.log('getUserMedia 호출 중... constraints:', JSON.stringify(constraints));
      let mediaStream: MediaStream;
      
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('카메라 스트림 획득 성공, 활성 트랙 수:', mediaStream.getVideoTracks().length);
      } catch (facingModeError: any) {
        // facingMode가 지원되지 않을 경우 기본 카메라 사용
        console.warn('facingMode를 사용할 수 없습니다. 기본 카메라를 사용합니다:', facingModeError);
        constraints = {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
          console.log('기본 카메라 스트림 획득 성공');
        } catch (fallbackError: any) {
          console.error('기본 카메라도 실패:', fallbackError);
          throw fallbackError;
        }
      }
      
      setStream(mediaStream);
      console.log('스트림 설정 완료');
      
      // 비디오 요소가 준비될 때까지 대기
      if (!videoRef.current) {
        console.warn('videoRef.current가 아직 null입니다. 대기 중...');
        let retries = 0;
        while (!videoRef.current && retries < 20) {
          await new Promise(resolve => setTimeout(resolve, 50));
          retries++;
        }
      }
      
      if (videoRef.current) {
        console.log('비디오 요소에 스트림 연결 중...');
        const video = videoRef.current;
        
        // 이전 스트림이 있다면 정리
        if (video.srcObject) {
          const oldStream = video.srcObject as MediaStream;
          oldStream.getTracks().forEach(track => track.stop());
        }
        
        // 카메라 활성화 상태를 먼저 설정 (UI 업데이트 - 비디오 요소를 보이게 함)
        setCameraActive(true);
        console.log('카메라 활성화 상태 설정 완료');
        
        // DOM 업데이트를 기다림 (비디오 요소가 보이도록)
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 비디오 요소가 실제로 보이는지 확인
        const isVisible = video.offsetWidth > 0 && video.offsetHeight > 0;
        console.log('비디오 요소 가시성:', isVisible, '크기:', video.offsetWidth, 'x', video.offsetHeight);
        
        // 비디오 일시정지 및 스트림 설정
        video.pause();
        video.srcObject = mediaStream;
        console.log('스트림을 비디오 요소에 연결 완료');
        
        // loadedmetadata 이벤트를 기다린 후 재생
        await new Promise<void>((resolve) => {
          const onLoadedMetadata = () => {
            console.log('비디오 메타데이터 로드 완료');
            video.removeEventListener('error', onError);
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            
            // 재생 시도
            video.play()
              .then(() => {
                console.log('비디오 재생 성공');
                resolve();
              })
              .catch((playError: any) => {
                // play() 중단 오류는 무시 (이미 재생 중일 수 있음)
                if (playError.name === 'AbortError' || playError.message?.includes('interrupted')) {
                  console.log('재생 요청이 중단되었지만 스트림은 활성화됨');
                } else {
                  console.error('비디오 재생 실패:', playError);
                  // 재생 실패 시에도 스트림은 활성화되어 있으므로 계속 진행
                }
                resolve();
              });
          };
          
          const onError = (error: Event) => {
            console.error('비디오 로드 실패:', error);
            video.removeEventListener('error', onError);
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            resolve();
          };
          
          // 이미 로드된 경우
          if (video.readyState >= 1) {
            onLoadedMetadata();
          } else {
            video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
            video.addEventListener('error', onError, { once: true });
            
            // 타임아웃 설정 (3초)
            setTimeout(() => {
              video.removeEventListener('error', onError);
              video.removeEventListener('loadedmetadata', onLoadedMetadata);
              console.warn('비디오 로드 타임아웃, 하지만 스트림은 활성화됨');
              resolve();
            }, 3000);
          }
        });
      } else {
        console.error('비디오 요소를 찾을 수 없습니다');
        alert('비디오 요소를 찾을 수 없습니다. 페이지를 새로고침해주세요.');
        setCameraActive(false);
        mediaStream.getTracks().forEach(track => track.stop());
      }
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
      setCameraActive(false);
    }
  }, [cameraActive, cameraSupported]);

  const stopCamera = useCallback(() => {
    console.log('카메라 중지 중...');
    setCameraActive(false);
    
    // 현재 스트림 정리
    setStream((currentStream) => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => {
          track.stop();
          console.log('트랙 중지:', track.kind);
        });
      }
      return null;
    });
    
    // 비디오 요소 정리
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('비디오 또는 캔버스 요소를 찾을 수 없습니다');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('캔버스 컨텍스트를 가져올 수 없습니다');
      return;
    }

    // 비디오 크기 확인
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error('비디오 크기가 0입니다');
      alert('비디오가 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${direction}-${Date.now()}.jpg`, {type: 'image/jpeg'});
        console.log('사진 촬영 완료:', file.name, file.size, 'bytes');
        // 먼저 이미지를 설정한 후 카메라 중지
        onChange(file);
        // 약간의 지연 후 카메라 중지 (이미지가 설정되도록)
        setTimeout(() => {
          stopCamera();
        }, 100);
      } else {
        console.error('Blob 생성 실패');
        alert('사진을 저장할 수 없습니다.');
      }
    }, 'image/jpeg', 0.9);
  }, [direction, onChange, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <Card className={cn(
      "border-[hsl(var(--doom-red))]/30 overflow-hidden transition-all",
      preview && "ring-2 ring-[hsl(var(--doom-red))]/50"
    )}>
      <CardContent className="p-0">
        <div className="relative aspect-square">
          {/* 비디오 요소는 항상 렌더링 (모바일 호환성) */}
          <video
            ref={videoRef}
            className={cn(
              "h-full w-full object-cover",
              !cameraActive && "hidden"
            )}
            autoPlay
            playsInline
            muted
            style={{ display: cameraActive ? 'block' : 'none' }}
          />
          {cameraActive && (
            <div className="absolute inset-0 flex items-end justify-center gap-2 p-4 bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
              <div className="flex gap-2 w-full pointer-events-auto">
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
          )}
          {!cameraActive && preview ? (
            <div className="relative h-full w-full">
              <img
                src={preview}
                alt={`${labels[direction]} 미리보기`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {cameraSupported && (
                  <Button
                    type="button"
                    variant="doom"
                    size="sm"
                    onClick={(e) => {
                      console.log('재촬영 버튼 클릭됨');
                      handleStartCamera(e);
                    }}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    재촬영
                  </Button>
                )}
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
          ) : !cameraActive ? (
            <div className="flex flex-col h-full items-center justify-center gap-3 bg-muted/50 hover:bg-muted/80 transition-colors p-4">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="h-8 w-8" />
                <span className="text-sm font-medium">{labels[direction]}</span>
              </div>
              <div className="flex gap-2 w-full">
                {cameraSupported ? (
                  <>
                    <Button
                      type="button"
                      variant="doom"
                      size="sm"
                      onClick={(e) => {
                        console.log('촬영 버튼 클릭됨');
                        handleStartCamera(e);
                      }}
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
                  </>
                ) : (
                  <label className="flex-1 w-full">
                    <Button
                      type="button"
                      variant="doom"
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
                )}
              </div>
            </div>
          ) : null}
        </div>
        <div className="p-2 bg-card border-t border-border">
          <p className="text-xs text-center text-muted-foreground font-medium">{labels[direction]}</p>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}

