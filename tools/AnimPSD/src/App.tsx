// src/App.tsx
import React, { useState } from 'react';
import { generatePsd, ImageItem, PsdSettings } from './lib/psdGenerator';

export default function App() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [settings, setSettings] = useState<PsdSettings>({
    width: 1920,
    height: 1080,
    dpi: 350,
    folderNaming: 'filename',
    customPrefix: 'cut_',
    layerNaming: 'filename'
  });

  // 画像追加ハンドラー
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newImages = Array.from(e.target.files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      width: 0, // 実際の解像度は読み込み時に取得するよう拡張可能
      height: 0
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const handleGenerate = async () => {
    if (images.length === 0) {
      alert("画像を選択してください");
      return;
    }
    await generatePsd(images, settings);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen p-4 gap-4 box-border">
      
      {/* 左パネル: 画像一覧エリア (iPad時のメイン操作領域) */}
      <div className="flex-1 bg-surface rounded-xl shadow-sm border border-border p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-[var(--color-text-main)]">画像リスト</h2>
        
        <div className="flex-1 overflow-y-auto mb-4 border-2 border-dashed border-border rounded-lg p-4">
          {images.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[var(--color-text-sub)]">
              画像をドラッグ＆ドロップ、または追加してください
            </div>
          ) : (
            <div className="space-y-2">
              {/* ここに @dnd-kit を使用した並び替えリストを実装します */}
              {images.map((img, i) => (
                <div key={img.id} className="p-3 bg-[var(--color-bg)] rounded border border-border flex items-center justify-between">
                  <span>{i + 1}. {img.name}</span>
                  <button onClick={() => setImages(images.filter(imgItem => imgItem.id !== img.id))} className="text-danger">削除</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <label className="bg-primary hover:bg-primary-hover text-white text-center py-4 rounded-lg cursor-pointer transition-colors text-lg font-bold">
          画像を追加 (複数選択可)
          <input type="file" multiple accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleImageUpload} />
        </label>
      </div>

      {/* 右パネル: 設定エリア (指でタップしやすいよう余白を大きめに) */}
      <div className="w-full md:w-80 bg-surface rounded-xl shadow-sm border border-border p-6 flex flex-col gap-6 overflow-y-auto">
        <h2 className="text-xl font-bold text-[var(--color-text-main)]">出力設定</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">キャンバス 幅 (px)</label>
            <input type="number" value={settings.width} onChange={e => setSettings({...settings, width: Number(e.target.value)})}
              className="w-full p-3 border border-border rounded-md bg-[var(--color-bg)] text-lg" />
          </div>
          <div>
            <label className="block text-sm mb-1">キャンバス 高さ (px)</label>
            <input type="number" value={settings.height} onChange={e => setSettings({...settings, height: Number(e.target.value)})}
              className="w-full p-3 border border-border rounded-md bg-[var(--color-bg)] text-lg" />
          </div>
          <div>
            <label className="block text-sm mb-1">DPI</label>
            <input type="number" value={settings.dpi} onChange={e => setSettings({...settings, dpi: Number(e.target.value)})}
              className="w-full p-3 border border-border rounded-md bg-[var(--color-bg)] text-lg" />
          </div>
          
          <hr className="border-border" />

          <div>
            <label className="block text-sm mb-1">フォルダ命名規則</label>
            <select value={settings.folderNaming} onChange={e => setSettings({...settings, folderNaming: e.target.value as any})}
              className="w-full p-3 border border-border rounded-md bg-[var(--color-bg)] text-lg">
              <option value="filename">元画像ファイル名</option>
              <option value="sequential">連番</option>
              <option value="custom">任意文字列＋連番</option>
            </select>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <button onClick={handleGenerate} className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-lg text-xl font-bold transition-colors shadow-md">
            PSDを生成する
          </button>
        </div>
      </div>

    </div>
  );
}
