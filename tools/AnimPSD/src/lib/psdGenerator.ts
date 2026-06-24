// src/lib/psdGenerator.ts
import 'ag-psd/initialize-canvas'; // 💡iPad（ブラウザ）でag-psdを動かすために必須の記述です！
import { writePsd, Psd, Layer } from 'ag-psd';

export interface ImageItem {
  id: string;
  file: File;
  name: string;
  width: number;
  height: number;
}

export interface PsdSettings {
  width: number;
  height: number;
  dpi: number;
  folderNaming: 'filename' | 'sequential' | 'custom';
  customPrefix: string;
  layerNaming: 'filename' | 'image' | 'same_as_folder';
}

const fileToCanvas = async (file: File): Promise<HTMLCanvasElement> => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  await new Promise((resolve) => {
    img.onload = resolve;
    img.src = url;
  });
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx?.drawImage(img, 0, 0);
  URL.revokeObjectURL(url);
  return canvas;
};

export const generatePsd = async (images: ImageItem[], settings: PsdSettings) => {
  const children: Layer[] = await Promise.all(images.map(async (img, index): Promise<Layer> => {
    const canvas = await fileToCanvas(img.file);

    let folderName = '';
    if (settings.folderNaming === 'filename') folderName = img.name.replace(/\.[^/.]+$/, "");
    else if (settings.folderNaming === 'sequential') folderName = String(index + 1);
    else folderName = `${settings.customPrefix}${index + 1}`;

    let layerName = '';
    if (settings.layerNaming === 'filename') layerName = img.name.replace(/\.[^/.]+$/, "");
    else if (settings.layerNaming === 'image') layerName = '画像';
    else layerName = folderName;

    return {
      name: folderName,
      opened: true,
      children: [
        {
          name: 'フォルダ',
          opened: true,
          children: [
            { name: 'レイヤー①' },
            { name: 'レイヤー②' }
          ]
        },
        {
          name: layerName,
          canvas: canvas
        }
      ]
    };
  }));

  const psd: Psd = {
    width: settings.width,
    height: settings.height,
    imageResources: {
      resolutionInfo: {
        hRes: settings.dpi,
        vRes: settings.dpi,
        hResUnit: 'PPI',
        vResUnit: 'PPI'
      }
    },
    children: children
  };

  const buffer = writePsd(psd);
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'template.psd';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
