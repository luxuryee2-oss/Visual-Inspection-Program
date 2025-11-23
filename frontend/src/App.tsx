import {FormProvider} from 'react-hook-form';
import {useMutation, useQuery} from '@tanstack/react-query';
import {ScanPanel} from './components/ScanPanel';
import {ImageUploader} from './components/ImageUploader';
import {InspectionHistory} from './components/InspectionHistory';
import {useInspectionForm} from './hooks/useInspectionForm';
import {fetchInspectionHistory, uploadInspection} from './api/inspections';
import type {InspectionDirection, InspectionFormValues} from './types/inspection';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';

function App() {
  const {form, setImage, resetImages} = useInspectionForm();
  const productCode = form.watch('productCode');

  const {data: history = [], isFetching} = useQuery({
    queryKey: ['history', productCode],
    queryFn: () => fetchInspectionHistory(productCode),
    enabled: Boolean(productCode),
    staleTime: 1000 * 60
  });

  const mutation = useMutation({
    mutationFn: uploadInspection,
    onSuccess: () => {
      form.reset();
      resetImages();
      alert('업로드가 완료되었습니다!');
    },
    onError: (error: any) => {
      alert(`업로드 실패: ${error?.response?.data?.message ?? error.message}`);
    }
  });

  const handleSubmit = form.handleSubmit((values: InspectionFormValues) => {
    mutation.mutate(values);
  });

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center space-y-2">
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
                  <ScanPanel value={productCode} onChange={(val) => form.setValue('productCode', val)} />

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
