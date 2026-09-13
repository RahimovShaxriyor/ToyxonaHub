import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hallsApi } from '../../api/halls.api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Skeleton from '../../components/ui/Skeleton';
import { normalizeApiError } from '../../utils/error';
import { ArrowLeft, Upload, Star, Trash2 } from 'lucide-react';

export function OwnerImagesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isPrimaryOnUpload, setIsPrimaryOnUpload] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState(null);

  const { data: hall, isLoading } = useQuery({
    queryKey: ['hall-images', id],
    queryFn: () => hallsApi.getHallById(id),
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (formData) => hallsApi.uploadImage(id, formData),
    onSuccess: () => {
      toast.success('Surat muvaffaqiyatli yuklandi!');
      setSelectedFile(null);
      setIsPrimaryOnUpload(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      queryClient.invalidateQueries({ queryKey: ['hall-images', id] });
    },
    onError: (err) => {
      const normalized = normalizeApiError(err, 'Suratni yuklashda xatolik yuz berdi.');
      toast.error(normalized.message);
    },
  });

  // Set primary mutation
  const setPrimaryMutation = useMutation({
    mutationFn: (imageId) => hallsApi.setPrimaryImage(id, imageId),
    onSuccess: () => {
      toast.success("Asosiy surat o'zgartirildi!");
      queryClient.invalidateQueries({ queryKey: ['hall-images', id] });
    },
    onError: (err) => {
      const normalized = normalizeApiError(err, 'Xatolik yuz berdi.');
      toast.error(normalized.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (imageId) => hallsApi.deleteImage(id, imageId),
    onSuccess: () => {
      toast.success("Surat o'chirildi!");
      setDeletingImageId(null);
      queryClient.invalidateQueries({ queryKey: ['hall-images', id] });
    },
    onError: (err) => {
      const normalized = normalizeApiError(err, "Suratni o'chirishda xatolik yuz berdi.");
      toast.error(normalized.message);
    },
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Iltimos, avval rasm faylini tanlang.');
      return;
    }

    const formData = new FormData();
    formData.append('images', selectedFile);
    formData.append('isPrimary', isPrimaryOnUpload ? 'true' : 'false');

    uploadMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const images = hall?.images || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/owner/halls')}
          className="p-2 rounded-xl border border-border text-muted hover:text-ink hover:bg-canvas transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink">
            {hall?.name} — Rasmlar boshqaruvi
          </h1>
          <p className="text-xs text-muted mt-0.5">
            To'yxona zali va interyeri suratlarini yuklang, asosiy suratni belgilang
          </p>
        </div>
      </div>

      {/* Upload Box */}
      <form
        onSubmit={handleUpload}
        className="bg-white rounded-2xl border border-border p-6 shadow-card space-y-4"
      >
        <h3 className="font-serif font-bold text-base text-ink">Yangi surat yuklash</h3>

        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-bronze transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="hall-image-file"
          />
          <label htmlFor="hall-image-file" className="cursor-pointer block">
            <Upload className="w-10 h-10 text-bronze mx-auto mb-2" />
            <span className="text-sm font-semibold text-ink block">
              {selectedFile ? selectedFile.name : 'Suratni tanlash uchun bu yerga bosing'}
            </span>
            <span className="text-xs text-muted block mt-1">
              JPG, PNG, WEBP (maksimal hajmi 5MB)
            </span>
          </label>
        </div>

        {selectedFile && (
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={isPrimaryOnUpload}
                onChange={(e) => setIsPrimaryOnUpload(e.target.checked)}
                className="w-4 h-4 rounded text-bronze focus:ring-bronze"
              />
              Ushbu suratni to'yxonaning asosiy surati (muqova) qilib belgilash
            </label>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={uploadMutation.isPending}
            >
              Yuklash
            </Button>
          </div>
        )}
      </form>

      {/* Uploaded Photos Grid */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-card space-y-4">
        <h3 className="font-serif font-bold text-base text-ink">
          Yuklangan suratlar ({images.length})
        </h3>

        {images.length === 0 ? (
          <div className="text-center py-8 text-muted text-xs">
            Hozircha hech qanday surat yuklanmagan.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative rounded-xl border border-border overflow-hidden group bg-zinc-100 shadow-xs"
              >
                <div className="h-44 overflow-hidden">
                  <img
                    src={img.url}
                    alt="To'yxona surati"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* Primary Badge */}
                {img.isPrimary && (
                  <div className="absolute top-2 left-2 bg-bronze text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <Star className="w-3 h-3 fill-white" />
                    Asosiy surat
                  </div>
                )}

                {/* Action buttons */}
                <div className="p-3 bg-white flex items-center justify-between gap-2 border-t border-border">
                  {!img.isPrimary && (
                    <button
                      type="button"
                      onClick={() => setPrimaryMutation.mutate(img.id)}
                      disabled={setPrimaryMutation.isPending}
                      className="text-xs text-muted hover:text-bronze flex items-center gap-1 font-medium transition-colors"
                    >
                      <Star className="w-3.5 h-3.5" />
                      Asosiy qilish
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setDeletingImageId(img.id)}
                    className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 ml-auto font-medium transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    O'chirish
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Destructive Action (Delete Image) */}
      <ConfirmDialog
        isOpen={!!deletingImageId}
        onClose={() => setDeletingImageId(null)}
        onConfirm={() => deleteMutation.mutate(deletingImageId)}
        isLoading={deleteMutation.isPending}
        title="Suratni o'chirish"
        message="Haqiqatan ham ushbu suratni o'chirmoqchimisiz? Bu surat katalog va to'yxona sahifasidan olib tashlanadi."
        confirmLabel="Ha, o'chirilsin"
        cancelLabel="Bekor qilish"
        variant="danger"
      />
    </div>
  );
}

export default OwnerImagesPage;
