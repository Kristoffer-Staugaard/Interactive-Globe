import React, { useState } from 'react';
import { Code, Copy, Check, X } from 'lucide-react';
import { GlobeConfig, MarkerData } from '../types';

interface ExportModalProps {
  config: GlobeConfig;
  markers: MarkerData[];
  onClose: () => void;
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

export function ExportModal({ config, markers, onClose }: ExportModalProps) {
  const [isCopied, setIsCopied] = useState(false);

  const generateCode = () => {
    return `import React from 'react';
import InteractiveGlobe from './components/InteractiveGlobe';

export default function MyGlobe() {
  return (
    <div style={{ width: '100%', height: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '800px', aspectRatio: '1/1' }}>
        <InteractiveGlobe 
          theta={${config.theta}}
          dark={${config.dark}}
          diffuse={${config.diffuse}}
          mapSamples={${config.mapSamples}}
          mapBrightness={${config.showDots ? config.mapBrightness : 0}}
          baseColor={[${config.showDots ? hexToRgb(config.baseColor).join(', ') : (config.dark > 0.5 ? '0, 0, 0' : '1, 1, 1')}]}
          markerColor={[${hexToRgb(config.markerColor).join(', ')}]}
          glowColor={[${hexToRgb(config.glowColor).map(v => v * config.glowIntensity).join(', ')}]}
          markers={${JSON.stringify(markers, null, 2).replace(/\n/g, '\n          ')}}
          scale={${config.scale}}
          offset={[${config.offsetX}, ${config.offsetY}]}
          rotationSpeed={${config.rotationSpeed}}
          dragSensitivity={${config.dragSensitivity}}
          enableFadeMask={${config.enableFadeMask}}
          showGraticule={${config.showGraticule}}
          graticuleColor="${config.graticuleColor}"
          graticuleOpacity={${config.graticuleOpacity}}
          graticuleScale={${config.graticuleScale}}
          showLandOutline={${config.showLandOutline}}
          landOutlineColor="${config.landOutlineColor}"
          landOutlineOpacity={${config.landOutlineOpacity}}
          landOutlineScale={${config.landOutlineScale}}
          pulseMarkers={${config.pulseMarkers}}
        />
      </div>
    </div>
  );
}`;
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(generateCode());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-white/10 rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Code size={20} />
            Export React Code
          </h3>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1 bg-neutral-950">
          <p className="text-sm text-neutral-400 mb-4">
            Copy this code into your React project. Make sure you have the <code className="text-neutral-200 bg-neutral-800 px-1 py-0.5 rounded">InteractiveGlobe.tsx</code> component in your project.
          </p>
          <pre className="text-sm text-neutral-300 font-mono bg-neutral-900 p-4 rounded-lg border border-white/5 overflow-x-auto">
            <code>{generateCode()}</code>
          </pre>
        </div>
        
        <div className="p-4 border-t border-white/10 flex justify-end bg-neutral-900">
          <button 
            onClick={handleCopyCode}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
          >
            {isCopied ? <Check size={18} /> : <Copy size={18} />}
            {isCopied ? "Copied!" : "Copy to Clipboard"}
          </button>
        </div>
      </div>
    </div>
  );
}
