import React, { useCallback, useMemo, useRef, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import { toast } from 'sonner'
import { Upload, Trash2, X } from 'lucide-react'

import { Label } from './ui/label'
import { Button } from './ui/button'
import { createCroppedImage } from '../utils/cropImage'
import { filesService } from '../services/files.service'

export interface ServiceBannerCropFieldProps {
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  uploadType?: string
  uploadDescription?: string
  outputSize?: { width: number; height: number }
  defaultFileName?: string
}

export function ServiceBannerCropField({
  value,
  onChange,
  onRemove,
  uploadType = 'SERVICE_IMAGE',
  uploadDescription = 'Banner do serviço',
  outputSize = { width: 1280, height: 720 },
  defaultFileName = 'provider-banner.jpg',
}: ServiceBannerCropFieldProps) {
  const MIN_ZOOM = 1
  const MAX_ZOOM = 3
  const DEFAULT_ZOOM = 1

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [croppedAreaPct, setCroppedAreaPct] = useState<Area | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const zoomPct = useMemo(
    () => `${((zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100}%`,
    [MAX_ZOOM, MIN_ZOOM, zoom]
  )

  const resetCropState = useCallback(() => {
    if (imageToCrop) URL.revokeObjectURL(imageToCrop)
    setImageToCrop(null)
    setCrop({ x: 0, y: 0 })
    setZoom(DEFAULT_ZOOM)
    setCroppedAreaPct(null)
  }, [DEFAULT_ZOOM, imageToCrop])

  const onCropAreaChange = useCallback((area: Area) => setCroppedAreaPct(area), [])

  const handlePickFile = () => fileInputRef.current?.click()

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
    setZoom(DEFAULT_ZOOM)
    setCroppedAreaPct(null)
    setImageToCrop(url)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleConfirm = async () => {
    if (!imageToCrop || !croppedAreaPct) {
      toast.error('Ajuste a área de corte antes de continuar')
      return
    }

    setIsUploading(true)
    const loadingToast = toast.loading('Enviando banner...')
    try {
      const blob = await createCroppedImage(imageToCrop, croppedAreaPct, {
        outputWidth: outputSize.width,
        outputHeight: outputSize.height,
      })

      const file = new File([blob], defaultFileName.replace(/\.[^.]+$/, '.jpg') || 'provider-banner.jpg', {
        type: 'image/jpeg',
      })

      const uploadResult = await filesService.upload(file as any, uploadType, uploadDescription)
      toast.dismiss(loadingToast)
      if (!uploadResult.success || !uploadResult.data) {
        throw new Error(uploadResult.error || 'Erro ao fazer upload')
      }
      onChange(uploadResult.data.url)
      toast.success('Banner atualizado! Salve o serviço para aplicar a nova imagem.')
      resetCropState()
    } catch (error: unknown) {
      toast.dismiss(loadingToast)
      const message = error instanceof Error ? error.message : 'Erro ao enviar o banner'
      toast.error(message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Label className="text-sm font-medium">Banner do serviço</Label>
          <p className="text-sm text-muted-foreground">Imagem de capa exibida para tutores. Proporção 16:9.</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button type="button" variant="outline" size="sm" onClick={handlePickFile} disabled={isUploading}>
            <Upload className="h-4 w-4 mr-2" />
            {imageToCrop ? 'Trocar' : value ? 'Alterar' : 'Adicionar'}
          </Button>
          {value && onRemove && (
            <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={onRemove} disabled={isUploading}>
              <Trash2 className="h-4 w-4 mr-2" />
              Remover
            </Button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
        className="sr-only"
        onChange={handleFileChange}
      />

      {!imageToCrop ? (
        <div className="w-full overflow-hidden rounded-xl border bg-muted/20">
          <div className="aspect-video w-full bg-black/5">
            {value ? (
              <img src={value} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
                Nenhum banner selecionado
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border bg-background overflow-hidden">
          <div className="relative w-full bg-black" style={{ height: 320, minHeight: 320 }}>
            <Cropper
              key={imageToCrop}
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              minZoom={MIN_ZOOM}
              maxZoom={MAX_ZOOM}
              objectFit="cover"
              restrictPosition
              aspect={16 / 9}
              cropShape="rect"
              showGrid
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropAreaChange={onCropAreaChange}
              onCropComplete={onCropAreaChange}
            />
          </div>

          <div className="p-4 space-y-3">
            <div className="space-y-2">
              <Label className="text-sm">Zoom</Label>
              <input
                type="range"
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
                style={
                  {
                    '--zoom-pct': zoomPct,
                  } as React.CSSProperties
                }
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={resetCropState} disabled={isUploading}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button type="button" onClick={handleConfirm} disabled={!croppedAreaPct || isUploading}>
                {isUploading ? 'Enviando...' : 'Cortar e usar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

