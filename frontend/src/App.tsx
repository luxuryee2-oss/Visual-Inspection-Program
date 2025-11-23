import {FormProvider} from 'react-hook-form';
import {useMutation, useQuery} from '@tanstack/react-query';
import './App.css';
import {ScanPanel} from './components/ScanPanel';
import {ImageUploader} from './components/ImageUploader';
import {InspectionHistory} from './components/InspectionHistory';
import {useInspectionForm} from './hooks/useInspectionForm';
import {fetchInspectionHistory, uploadInspection} from './api/inspections';
import type {InspectionDirection, InspectionFormValues} from './types/inspection';

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
    <div className="app-shell">
      <header>
        <div>
          <p className="eyebrow">Visual Inspection</p>
          <h1>제품 스캔 & SharePoint 기록</h1>
          <p className="subtitle">상·하·좌·우 사진을 업로드하고 기록을 추적하세요.</p>
        </div>
      </header>

      <main>
        <section className="layout-grid">
          <FormProvider {...form}>
            <form onSubmit={handleSubmit} className="form-card">
              <ScanPanel value={productCode} onChange={(val) => form.setValue('productCode', val)} />

              <div className="form-group">
                <label>제품명</label>
                <input type="text" {...form.register('modelName')} placeholder="예) Smart Camera" />
              </div>
              <div className="form-group">
                <label>검사자</label>
                <input type="text" {...form.register('inspectedBy')} placeholder="이름 또는 ID" />
              </div>
              <div className="form-group">
                <label>메모</label>
                <textarea rows={3} {...form.register('notes')} placeholder="특이사항을 입력하세요." />
              </div>

              <div className="image-grid">
                {(['front', 'back', 'left', 'right'] as InspectionDirection[]).map((direction) => (
                  <ImageUploader
                    key={direction}
                    direction={direction}
                    value={form.watch(`images.${direction}` as const)}
                    onChange={(file) => setImage(direction, file)}
                  />
                ))}
              </div>

              <button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? '업로드 중...' : 'SharePoint 업로드'}
              </button>
            </form>
          </FormProvider>

          <InspectionHistory entries={history} loading={isFetching} />
        </section>
      </main>
    </div>
  );
}

export default App;
