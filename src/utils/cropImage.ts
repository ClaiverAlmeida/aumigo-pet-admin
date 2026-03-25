import type { Area } from 'react-easy-crop';

const DEFAULT_OUTPUT_SIZE = 512;

/**
 * Gera um Blob da imagem recortada (quadrado) a partir da área em percentual.
 * Usado pelo PhotoCropUpload e por qualquer fluxo de crop + upload.
 */
export async function createCroppedImage(
  imageSrc: string,
  cropPercent: Area,
  outputSizeOrOptions:
    | number
    | {
        outputWidth: number;
        outputHeight: number;
      } = DEFAULT_OUTPUT_SIZE
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const nw = image.naturalWidth;
      const nh = image.naturalHeight;
      const x = (cropPercent.x / 100) * nw;
      const y = (cropPercent.y / 100) * nh;
      const w = (cropPercent.width / 100) * nw;
      const h = (cropPercent.height / 100) * nh;
      const output =
        typeof outputSizeOrOptions === 'number'
          ? { outputWidth: outputSizeOrOptions, outputHeight: outputSizeOrOptions }
          : outputSizeOrOptions;
      const canvas = document.createElement('canvas');
      canvas.width = output.outputWidth;
      canvas.height = output.outputHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas não disponível'));
        return;
      }
      ctx.drawImage(image, x, y, w, h, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Falha ao gerar imagem'))),
        'image/jpeg',
        0.9
      );
    };
    image.onerror = () => reject(new Error('Falha ao carregar imagem'));
  });
}
