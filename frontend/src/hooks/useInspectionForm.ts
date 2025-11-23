import {useCallback, useMemo} from 'react';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import type {InspectionDirection, InspectionFormValues} from '../types/inspection';

const directions: InspectionDirection[] = ['front', 'back', 'left', 'right'];

const schema = z.object({
  productCode: z.string().min(1, '제품 코드를 입력하세요.'),
  modelName: z.string().min(1, '제품명을 입력하세요.'),
  inspectedBy: z.string().min(1, '검사자를 입력하세요.'),
  notes: z.string().optional(),
  images: z.object({
    front: z.custom<File | null>((val) => val === null || val instanceof File).refine((val) => val !== null, '정면 이미지를 업로드하세요.'),
    back: z.custom<File | null>((val) => val === null || val instanceof File).refine((val) => val !== null, '후면 이미지를 업로드하세요.'),
    left: z.custom<File | null>((val) => val === null || val instanceof File).refine((val) => val !== null, '좌측 이미지를 업로드하세요.'),
    right: z.custom<File | null>((val) => val === null || val instanceof File).refine((val) => val !== null, '우측 이미지를 업로드하세요.')
  })
});

const defaultImages = directions.reduce<Record<InspectionDirection, File | null>>((acc, dir) => {
  acc[dir] = null;
  return acc;
}, {} as Record<InspectionDirection, File | null>);

export function useInspectionForm() {
  const form = useForm<InspectionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      productCode: '',
      modelName: '',
      inspectedBy: '',
      notes: '',
      images: defaultImages
    }
  });

  const setImage = useCallback(
    (direction: InspectionDirection, file: File | null) => {
      const currentImages = form.getValues('images');
      form.setValue('images', {...currentImages, [direction]: file}, {shouldValidate: true});
    },
    [form]
  );

  const resetImages = useCallback(() => {
    form.setValue('images', defaultImages);
  }, [form]);

  return useMemo(
    () => ({
      form,
      setImage,
      resetImages
    }),
    [form, resetImages, setImage]
  );
}

