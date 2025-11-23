import type {InspectionDirection} from '../types/inspection';

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
  const preview = value ? URL.createObjectURL(value) : null;

  return (
    <div className="image-card">
      <div className="image-card-header">
        <h3>{labels[direction]}</h3>
        {value && (
          <button type="button" className="muted-link" onClick={() => onChange(null)}>
            삭제
          </button>
        )}
      </div>
      <label className="upload-box">
        {preview ? <img src={preview} alt={`${labels[direction]} 미리보기`} /> : <span>이미지 선택</span>}
        <input
          type="file"
          accept="image/*"
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
          hidden
        />
      </label>
    </div>
  );
}

