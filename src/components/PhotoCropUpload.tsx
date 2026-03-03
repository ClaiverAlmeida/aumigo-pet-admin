import React, { useState, useCallback, useRef } from 'react'
import { Upload, Trash2 } from 'lucide-react'
import Cropper, { type Area } from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import { toast } from 'sonner'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { createCroppedImage } from '../utils/cropImage'
import { filesService } from '../services/files.service'

export interface PhotoCropUploadProps {
  value?: string
  onUploaded: (url: string) => void | Promise<void>
  onRemove?: () => void
  uploadType?: string
  uploadDescription?: string
  loadingMessage?: string
  successMessage?: string
  modalTitle?: string
  modalSubtitle?: string
  confirmButtonText?: string
  sectionTitle?: string
  sectionDescription?: string
  fallbackLabel?: string
  triggerClassName?: string
  triggerStyle?: React.CSSProperties
  defaultFileName?: string
  /** Se true, usa área quadrada para produto/serviço em vez de avatar redondo */
  variant?: 'avatar' | 'product'
}

const CROPPER_Z_INDEX_STYLES = `
  .photo-crop-modal-cropper .reactEasyCrop_Image,
  .photo-crop-modal-cropper .reactEasyCrop_Video { z-index: 0; }
  .photo-crop-modal-cropper .reactEasyCrop_CropArea { z-index: 2; }
  .photo-crop-modal-cropper .reactEasyCrop_CropAreaGrid::before,
  .photo-crop-modal-cropper .reactEasyCrop_CropAreaGrid::after { z-index: 1; }
`

const ZOOM_SLIDER_STYLES = `
  .photo-crop-zoom-range {
    -webkit-appearance: none; appearance: none;
    width: 100%; height: 16px; border-radius: 9999px;
    background: linear-gradient(to right, #0d9488 0%, #0d9488 var(--zoom-pct, 0%), #e5e7eb var(--zoom-pct, 0%), #e5e7eb 100%);
    outline: none;
  }
  .photo-crop-zoom-range::-webkit-slider-thumb {
    -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%;
    background: #fff; border: 2px solid #0d9488; box-shadow: 0 1px 3px rgba(0,0,0,0.2); cursor: pointer;
  }
  .photo-crop-zoom-range::-moz-range-thumb {
    width: 20px; height: 20px; border-radius: 50%;
    background: #fff; border: 2px solid #0d9488; box-shadow: 0 1px 3px rgba(0,0,0,0.2); cursor: pointer;
  }
`

export function PhotoCropUpload({
  value,
  onUploaded,
  onRemove,
  uploadType = 'PROFILE_IMAGE',
  uploadDescription = 'Foto',
  loadingMessage = 'Enviando foto...',
  successMessage = 'Foto atualizada!',
  modalTitle = 'Cortar foto',
  modalSubtitle = 'Ajuste a área de corte. A foto será quadrada. Arraste para mover e use o zoom.',
  confirmButtonText = 'Cortar e salvar',
  sectionTitle = 'Foto',
  sectionDescription = 'Adicione uma imagem.',
  fallbackLabel = '?',
  triggerClassName,
  triggerStyle,
  defaultFileName = 'photo.jpg',
  variant = 'avatar',
}: PhotoCropUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showCropModal, setShowCropModal] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPct, setCroppedAreaPct] = useState<Area | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const onCropAreaChange = useCallback((croppedArea: Area) => {
    setCroppedAreaPct(croppedArea)
  }, [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem válida')
      return
    }
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('A imagem deve ter no máximo 5MB')
      return
    }
    const url = URL.createObjectURL(file)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPct(null)
    setImageToCrop(url)
    if (fileInputRef.current) fileInputRef.current.value = ''
    requestAnimationFrame(() => setShowCropModal(true))
  }

  const handleCropCancel = useCallback(() => {
    if (imageToCrop) URL.revokeObjectURL(imageToCrop)
    setShowCropModal(false)
    setImageToCrop(null)
    setCroppedAreaPct(null)
  }, [imageToCrop])

  const handleCropConfirm = async () => {
    if (!imageToCrop || !croppedAreaPct) {
      toast.error('Ajuste a área de corte antes de continuar')
      return
    }
    setIsUploadingImage(true)
    const loadingToast = toast.loading(loadingMessage)
    try {
      const blob = await createCroppedImage(imageToCrop, croppedAreaPct)
      const file = new File(
        [blob],
        defaultFileName.replace(/\.[^.]+$/, '.jpg') || 'photo.jpg',
        { type: 'image/jpeg' }
      )
      const uploadResult = await filesService.upload(file, uploadType, uploadDescription)
      toast.dismiss(loadingToast)
      if (!uploadResult.success || !uploadResult.data) {
        throw new Error(uploadResult.error || 'Erro ao fazer upload')
      }
      const url = uploadResult.data.url
      await onUploaded(url)
      toast.success(successMessage)
      handleCropCancel()
    } catch (error: unknown) {
      toast.dismiss(loadingToast)
      const message = error instanceof Error ? error.message : 'Erro ao enviar a foto'
      toast.error(message)
    } finally {
      setIsUploadingImage(false)
    }
  }

  return (
    <>
      {showCropModal && imageToCrop && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => e.target === e.currentTarget && handleCropCancel()}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 pb-0 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-800">{modalTitle}</h2>
              <p className="text-sm text-gray-600 mt-1">{modalSubtitle}</p>
            </div>
            <div
              className="photo-crop-modal-cropper relative w-full flex-shrink-0 bg-black overflow-hidden"
              style={{ height: 320, minHeight: 320 }}
            >
              <style>{CROPPER_Z_INDEX_STYLES}</style>
              <Cropper
                key={imageToCrop}
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="rect"
                showGrid
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropAreaChange={onCropAreaChange}
                onCropComplete={onCropAreaChange}
              />
            </div>
            <div className="p-4 space-y-4 flex-shrink-0">
              <style>{ZOOM_SLIDER_STYLES}</style>
              <div className="space-y-2">
                <Label className="text-sm">Zoom</Label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="photo-crop-zoom-range w-full"
                  style={{ '--zoom-pct': `${((zoom - 1) / 2) * 100}%` } as React.CSSProperties}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleCropCancel}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCropConfirm}
                  disabled={!croppedAreaPct || isUploadingImage}
                  className="px-4 py-2 bg-aumigo-teal text-white rounded-xl font-medium hover:bg-aumigo-teal/90 disabled:opacity-50"
                >
                  {isUploadingImage ? 'Enviando...' : confirmButtonText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`flex items-center gap-6 ${triggerClassName ?? ''}`} style={triggerStyle}>
        <div className="relative flex-shrink-0">
          {variant === 'product' ? (
            <div className="w-32 h-32 rounded-xl border-2 border-border bg-muted/30 overflow-hidden flex items-center justify-center">
              {value ? (
                <img src={value} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl text-muted-foreground font-medium">{fallbackLabel}</span>
              )}
            </div>
          ) : (
            <Avatar className="h-24 w-24">
              <AvatarImage src={value} alt="" className="object-cover" />
              <AvatarFallback className="text-xl bg-aumigo-teal/10 text-aumigo-teal">
                {fallbackLabel}
              </AvatarFallback>
            </Avatar>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
            className="absolute -left-[9999px] w-0 h-0 p-0 m-0 border-0 opacity-0 overflow-hidden cursor-pointer min-w-0 min-h-0"
            onChange={handleFileChange}
            aria-hidden
            tabIndex={-1}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium mb-1">{sectionTitle}</h3>
          <p className="text-muted-foreground text-sm mb-3">{sectionDescription}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
            >
              <Upload className="h-4 w-4 shrink-0" />
              {isUploadingImage ? 'Enviando...' : value ? 'Alterar foto' : 'Adicionar foto'}
            </Button>
            {value && onRemove && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive cursor-pointer gap-2"
                onClick={onRemove}
                disabled={isUploadingImage}
              >
                <Trash2 className="h-4 w-4 shrink-0" />
                Remover
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
