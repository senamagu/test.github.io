// src/lib/psdGenerator.ts
import 'ag-psd/initialize-canvas'; // 【追加】ブラウザでag-psdを動かすための必須設定
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
  // TypeScriptのエラーを防ぐため「戻り値は Layer の配列である」と明記
  const children: Layer[] = await Promise.all(images.map(async (img, index): Promise<Layer> => {
    const canvas = await fileToCanvas(img.file);

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

  // 【修正】ag-psdの型定義に合わせた正しい構造（DPIの設定）
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
  
  // ダウンロード処理
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'template.psd';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
