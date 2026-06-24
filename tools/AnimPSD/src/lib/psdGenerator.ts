// src/lib/psdGenerator.ts
import { writePsd } from 'ag-psd';

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

// FileをCanvasに変換するヘルパー
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
  // ag-psdは配列の先頭が「上」のレイヤーとなるため、
  // リストの並び順（上から下）に合わせて生成します。
  const children = await Promise.all(images.map(async (img, index) => {
    const canvas = await fileToCanvas(img.file);
    const seqNum = images.length - index; // 下から1,2,3とするか上からかは要調整

    // フォルダ名決定ロジック
    let folderName = '';
    if (settings.folderNaming === 'filename') folderName = img.name.replace(/\.[^/.]+$/, "");
    else if (settings.folderNaming === 'sequential') folderName = String(index + 1);
    else folderName = `${settings.customPrefix}${index + 1}`;

    // レイヤー名決定ロジック
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

  const psd = {
    width: settings.width,
    height: settings.height,
    resolution: settings.dpi,
    children: children
  };

  const buffer = writePsd(psd);
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  
  // ダウンロード処理
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'template.psd';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
