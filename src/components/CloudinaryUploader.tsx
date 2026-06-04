import { useState, useRef } from "react";
import { uploadToCloudinary, cldOptimize, type CloudinaryUploadResult } from "@/lib/cloudinary";
import { Upload, X, Loader2 } from "lucide-react";

export interface UploadedImage {
  url: string;
  public_id: string;
}

export function CloudinaryUploader({
  value,
  onChange,
  min = 3,
  max = 10,
}: {
  value: UploadedImage[];
  onChange: (imgs: UploadedImage[]) => void;
  min?: number;
  max?: number;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    const remaining = max - value.length;
    const list = Array.from(files).slice(0, remaining);
    setUploading(true);
    const next: UploadedImage[] = [...value];
    for (const file of list) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 10 * 1024 * 1024) { setError("Each image must be under 10MB"); continue; }
      try {
        const res: CloudinaryUploadResult = await uploadToCloudinary(file, setProgress);
        next.push({ url: res.secure_url, public_id: res.public_id });
        onChange([...next]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      }
    }
    setUploading(false);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (idx: number) => {
    const next = [...value];
    next.splice(idx, 1);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {value.map((img, i) => (
          <div key={img.public_id} className="relative aspect-square rounded-lg overflow-hidden gold-border group">
            <img src={cldOptimize(img.url, 400)} alt="" className="w-full h-full object-cover" />
            {i === 0 && (
              <div className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-[var(--gold)] text-[var(--primary-foreground)] font-semibold">
                FEATURED
              </div>
            )}
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-background/80 backdrop-blur opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-lg gold-border border-dashed flex flex-col items-center justify-center gap-2 hover:bg-accent transition text-muted-foreground"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-xs">{progress}%</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span className="text-xs">Add images</span>
              </>
            )}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="text-xs text-muted-foreground">
        Minimum {min} images required. {value.length} uploaded.
      </div>
      {error && <div className="text-xs text-destructive">{error}</div>}
    </div>
  );
}
