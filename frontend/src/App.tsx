import {useState, useEffect} from 'react';
import {FormProvider} from 'react-hook-form';
import {useMutation, useQuery} from '@tanstack/react-query';
import {ScanPanel} from './components/ScanPanel';
import {ImageUploader} from './components/ImageUploader';
import {InspectionHistory} from './components/InspectionHistory';
import {Login} from './components/Login';
import {useInspectionForm} from './hooks/useInspectionForm';
import {fetchInspectionHistory, uploadInspection} from './api/inspections';
import {getProductByUniqueCode} from './api/products';
// 임시: 인증 관련 import 비활성화 (테스트용)
// import {getCurrentUser, removeAuthToken} from './api/auth';
import type {InspectionDirection, InspectionFormValues, InspectionHistoryEntry} from './types/inspection';
import type {User} from './api/auth';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {LogOut} from 'lucide-react';

function App() {
  // 임시: 로그인 없이 바로 메인 화면 표시 (테스트용)
  // 배포 환경과 로컬 환경 모두에서 작동
  const [user] = useState<User | null>({
    id: '1',
    username: 'test-user',
    name: '테스트 사용자',
    role: 'inspector'
  });
  const [loading] = useState(false);
  const {form, setImage, resetImages} = useInspectionForm();
  const productCode = form.watch('productCode');

  // 제품 정보 자동 조회 및 제품명 자동 추출
  const handleProductFound = async (scannedValue: string, uniqueCode: string) => {
    try {
      // 제품 코드 설정
      form.setValue('productCode', scannedValue);
      
      // 제품명 자동 추출: P 다음 91958포함 10자리 + E 다음 JW + C 다음 7-9번째 자리
      const extractProductName = (code: string): string | null => {
        try {
          // 1. P 다음에 91958 포함 10자리 찾기
          const pIndex = code.indexOf('P');
          if (pIndex === -1) {
            console.log('P를 찾을 수 없습니다');
            return null;
          }
          
          const afterP = code.substring(pIndex + 1);
          const index91958 = afterP.indexOf('91958');
          if (index91958 === -1) {
            console.log('91958을 찾을 수 없습니다');
            return null;
          }
          
          // P 다음부터 91958 포함 10자리 추출
          const startPos = index91958; // P 다음에서 91958의 위치
          const tenDigits = afterP.substring(startPos, startPos + 10);
          if (tenDigits.length < 10) {
            console.log('10자리를 추출할 수 없습니다:', tenDigits);
            return null;
          }
          
          // 2. E 다음에 JW 찾기 (EJW 패턴 찾기)
          const ejwIndex = code.indexOf('EJW');
          if (ejwIndex === -1) {
            console.log('EJW를 찾을 수 없습니다');
            return null;
          }
          
          const jwPart = 'JW';
          
          // 3. C 다음 문자열에서 7번째부터 9번째까지 추출
          // 예: "C020100007000000A2" → C 다음 "020100007000000A2"
          // 1번째=인덱스0(0), 2번째=인덱스1(2), 3번째=인덱스2(0), 4번째=인덱스3(1), 
          // 5번째=인덱스4(0), 6번째=인덱스5(0), 7번째=인덱스6(0), 8번째=인덱스7(0), 9번째=인덱스8(7)
          // 따라서 인덱스 6부터 9까지 = "007"
          const cIndex = code.lastIndexOf('C');
          if (cIndex === -1) {
            console.log('C를 찾을 수 없습니다');
            return null;
          }
          
          const afterC = code.substring(cIndex + 1);
          if (afterC.length < 9) {
            console.error('C 다음 문자열이 9자리보다 짧습니다:', afterC, '길이:', afterC.length);
            return null;
          }
          
          // C 다음 문자열에서 7번째부터 9번째까지 (인덱스 6부터 9까지, 3자리)
          const cDigits = afterC.substring(6, 9);
          
          // 디버깅: 콘솔에 추출 과정 출력
          console.log('=== 제품명 추출 디버깅 ===');
          console.log('전체 코드:', code);
          console.log('전체 코드 길이:', code.length);
          console.log('P 위치:', pIndex);
          console.log('P 다음 91958 포함 10자리:', tenDigits);
          console.log('EJW 위치:', ejwIndex);
          console.log('C 위치 (lastIndexOf):', cIndex);
          console.log('C 다음 문자열:', afterC);
          console.log('C 다음 문자열 길이:', afterC.length);
          console.log('7-9번째 자리 (인덱스 6-9):', cDigits);
          console.log('추출된 전체 제품명:', `${tenDigits}${jwPart}${cDigits}`);
          console.log('========================');
          
          // 최종 제품명: 91958포함10자리 + JW + C 다음 7-9번째 자리
          return `${tenDigits}${jwPart}${cDigits}`;
        } catch (error) {
          console.error('제품명 추출 중 오류:', error);
          return null;
        }
      };
      
      const extractedName = extractProductName(scannedValue);
      if (extractedName) {
        form.setValue('modelName', extractedName);
      } else {
        // 추출 실패 시 제품 정보 조회 시도
        const product = await getProductByUniqueCode(uniqueCode);
        if (product) {
          form.setValue('modelName', product.productName);
        }
      }
    } catch (error) {
      console.error('제품 정보 조회 실패:', error);
      form.setValue('productCode', scannedValue);
    }
  };

  // 모든 Hook은 조건부 렌더링 전에 호출되어야 함
  // 임시: 백엔드 연결 없이도 작동하도록 에러 무시
  const {data: history = [], isFetching} = useQuery<InspectionHistoryEntry[]>({
    queryKey: ['history', productCode],
    queryFn: () => fetchInspectionHistory(productCode),
    enabled: Boolean(productCode && user), // user가 있을 때만 실행
    staleTime: 1000 * 60,
    retry: false // 재시도 비활성화 (백엔드 없어도 에러 안 나게)
  });

  const mutation = useMutation({
    mutationFn: uploadInspection,
    onSuccess: () => {
      form.reset();
      resetImages();
      alert('업로드가 완료되었습니다!');
    },
    onError: (error: any) => {
      // 임시: 백엔드 연결 실패 시에도 테스트 가능하도록
      const errorMessage = error?.response?.data?.message ?? error.message;
      if (errorMessage.includes('Network') || errorMessage.includes('CORS') || errorMessage.includes('405')) {
        alert('테스트 모드: 백엔드 서버가 연결되지 않았습니다. 로컬에서 백엔드를 실행하거나 Railway에 배포하세요.');
      } else {
        alert(`업로드 실패: ${errorMessage}`);
      }
    }
  });

  // 임시: 인증 확인 비활성화 (테스트용)
  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const token = getAuthToken();
  //     if (!token) {
  //       setLoading(false);
  //       return;
  //     }

  //     try {
  //       const currentUser = await getCurrentUser();
  //       setUser(currentUser);
  //       // 검사자 정보 자동 입력
  //       form.setValue('inspectedBy', currentUser.name || currentUser.username);
  //     } catch (error) {
  //       removeAuthToken();
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   checkAuth();
  // }, [form]);

  // 임시: 테스트 사용자 정보 자동 입력
  useEffect(() => {
    if (user) {
      form.setValue('inspectedBy', user.name || user.username);
    }
  }, [user, form]);

  const handleLoginSuccess = async () => {
    // 임시: 로그인 성공 처리 비활성화 (테스트용)
    // try {
    //   const currentUser = await getCurrentUser();
    //   setUser(currentUser);
    //   form.setValue('inspectedBy', currentUser.name || currentUser.username);
    // } catch (error) {
    //   console.error('사용자 정보 조회 실패:', error);
    //   removeAuthToken();
    //   setUser(null);
    // }
  };

  const handleLogout = () => {
    // 임시: 로그아웃 비활성화 (테스트용)
    // removeAuthToken();
    // setUser(null);
    form.reset();
    resetImages();
    alert('테스트 모드: 로그아웃이 비활성화되어 있습니다.');
  };

  const handleSubmit = form.handleSubmit((values: InspectionFormValues) => {
    mutation.mutate(values);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user.name} ({user.username})
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            </div>
        </div>
          <p className="text-sm font-mono text-[hsl(var(--doom-red))] uppercase tracking-wider">Visual Inspection</p>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[hsl(var(--doom-red))] via-[hsl(var(--doom-orange))] to-[hsl(var(--doom-yellow))] bg-clip-text text-transparent">
            제품 스캔 & SharePoint 기록
          </h1>
          <p className="text-muted-foreground">상·하·좌·우 사진을 업로드하고 기록을 추적하세요.</p>
      </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormProvider {...form}>
            <Card className="border-[hsl(var(--doom-red))]/30 shadow-[0_0_20px_hsl(var(--doom-red))]/20">
              <CardHeader>
                <CardTitle className="text-[hsl(var(--doom-red))]">검사 정보 입력</CardTitle>
                <CardDescription>제품 정보와 사진을 업로드하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <ScanPanel
                    value={productCode}
                    onChange={(val) => form.setValue('productCode', val)}
                    onProductFound={handleProductFound}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="modelName">제품명</Label>
                    <Input
                      id="modelName"
                      {...form.register('modelName')}
                      placeholder="예) Smart Camera"
                      className="border-input/50 focus-visible:ring-[hsl(var(--doom-red))]"
                    />
              </div>

                  <div className="space-y-2">
                    <Label htmlFor="inspectedBy">검사자</Label>
                    <Input
                      id="inspectedBy"
                      {...form.register('inspectedBy')}
                      placeholder="이름 또는 ID"
                      className="border-input/50 focus-visible:ring-[hsl(var(--doom-red))]"
                    />
              </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">메모</Label>
                    <Textarea
                      id="notes"
                      rows={3}
                      {...form.register('notes')}
                      placeholder="특이사항을 입력하세요."
                      className="border-input/50 focus-visible:ring-[hsl(var(--doom-red))]"
                    />
              </div>

                  <div className="grid grid-cols-2 gap-4">
                {(['front', 'back', 'left', 'right'] as InspectionDirection[]).map((direction) => (
                  <ImageUploader
                    key={direction}
                    direction={direction}
                    value={form.watch(`images.${direction}` as const)}
                    onChange={(file) => setImage(direction, file)}
                  />
                ))}
              </div>

                  <Button
                    type="submit"
                    variant="doom"
                    size="lg"
                    disabled={mutation.isPending}
                    className="w-full"
                  >
                {mutation.isPending ? '업로드 중...' : 'SharePoint 업로드'}
                  </Button>
            </form>
              </CardContent>
            </Card>
          </FormProvider>

          <InspectionHistory entries={history} loading={isFetching} />
        </div>
      </div>
    </div>
  );
}

export default App;
