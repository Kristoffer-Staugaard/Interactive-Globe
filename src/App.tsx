import { useState } from "react";
import InteractiveGlobe from "./components/InteractiveGlobe";
import { Trash2, Plus, Code } from "lucide-react";
import { GlobeConfig, MarkerData, defaultGlobeConfig } from "./types";
import { SliderControl } from "./components/SliderControl";
import { ExportModal } from "./components/ExportModal";

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

export default function App() {
  const [config, setConfig] = useState<GlobeConfig>(defaultGlobeConfig);

  const [markers, setMarkers] = useState<MarkerData[]>([
    { location: [37.7595, -122.4367], size: 0.03, label: "San Francisco" },
    { location: [40.7128, -74.006], size: 0.1, label: "New York" },
    { location: [51.5072, 0.1276], size: 0.08, label: "London" },
    { location: [35.6895, 139.6917], size: 0.12, label: "Tokyo" },
  ]);

  const [showExportModal, setShowExportModal] = useState(false);

  const updateConfig = (key: keyof GlobeConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleAddMarker = () => {
    setMarkers([...markers, { location: [0, 0], size: 0.05, label: "New Marker" }]);
  };

  const handleUpdateMarker = (index: number, field: 'lat' | 'lng' | 'size' | 'label', value: any) => {
    const newMarkers = [...markers];
    if (field === 'lat') newMarkers[index].location[0] = value;
    if (field === 'lng') newMarkers[index].location[1] = value;
    if (field === 'size') newMarkers[index].size = value;
    if (field === 'label') newMarkers[index].label = value;
    setMarkers(newMarkers);
  };

  const handleDeleteMarker = (index: number) => {
    setMarkers(markers.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 flex flex-col md:flex-row font-sans">
      {/* Controls Sidebar */}
      <div className="w-full md:w-96 bg-neutral-900 border-r border-white/10 p-6 overflow-y-auto flex flex-col gap-8 shrink-0 shadow-2xl z-20 h-screen">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Globe Settings</h2>
            <p className="text-sm text-neutral-400 mt-1">Customize your interactive globe.</p>
          </div>
          <button 
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 bg-white text-black px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors"
          >
            <Code size={16} />
            Export
          </button>
        </div>

        <div className="space-y-8">
          
          {/* General & Camera */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider">General & Camera</h3>
            
            <SliderControl label="Scale" value={config.scale} onChange={(v) => updateConfig('scale', v)} min={0.5} max={2.5} step={0.05} />
            <SliderControl label="Offset X" value={config.offsetX} onChange={(v) => updateConfig('offsetX', v)} min={-1000} max={1000} step={10} />
            <SliderControl label="Offset Y" value={config.offsetY} onChange={(v) => updateConfig('offsetY', v)} min={-1000} max={1000} step={10} />
            <SliderControl label="Vertical Angle (Theta)" value={config.theta} onChange={(v) => updateConfig('theta', v)} min={0} max={3.14} step={0.01} />
            <SliderControl label="Auto-Rotation Speed" value={config.rotationSpeed} onChange={(v) => updateConfig('rotationSpeed', v)} min={0} max={0.05} step={0.001} />
            <SliderControl label="Drag Sensitivity" value={config.dragSensitivity} onChange={(v) => updateConfig('dragSensitivity', v)} min={0.001} max={0.02} step={0.001} />

            <div className="flex items-center justify-between pt-2">
              <label className="text-neutral-300 font-medium text-sm">Enable Fade Mask</label>
              <button 
                onClick={() => updateConfig('enableFadeMask', !config.enableFadeMask)}
                className={`w-10 h-6 rounded-full transition-colors relative ${config.enableFadeMask ? 'bg-white' : 'bg-neutral-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-neutral-900 absolute top-1 transition-transform ${config.enableFadeMask ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="h-px bg-white/10 w-full" />

          {/* Point Cloud Map */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider">Point Cloud Map</h3>
            
            <div className="flex items-center justify-between">
              <label className="text-neutral-300 font-medium text-sm">Show Point Cloud (Dots)</label>
              <button 
                onClick={() => updateConfig('showDots', !config.showDots)}
                className={`w-10 h-6 rounded-full transition-colors relative ${config.showDots ? 'bg-white' : 'bg-neutral-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-neutral-900 absolute top-1 transition-transform ${config.showDots ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>

            {config.showDots && (
              <>
                <div className="flex justify-between text-sm items-center pt-2">
                  <label className="text-neutral-300 font-medium">Base Color</label>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500 font-mono text-xs uppercase">{config.baseColor}</span>
                    <input type="color" value={config.baseColor} onChange={(e) => updateConfig('baseColor', e.target.value)} className="color-picker" />
                  </div>
                </div>

                <div className="flex justify-between text-sm items-center">
                  <label className="text-neutral-300 font-medium">Glow Color</label>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500 font-mono text-xs uppercase">{config.glowColor}</span>
                    <input type="color" value={config.glowColor} onChange={(e) => updateConfig('glowColor', e.target.value)} className="color-picker" />
                  </div>
                </div>

                <div className="pt-2 space-y-4">
                  <SliderControl label="Glow Intensity" value={config.glowIntensity} onChange={(v) => updateConfig('glowIntensity', v)} min={0} max={5} step={0.1} />
                  <SliderControl label="Darkness" value={config.dark} onChange={(v) => updateConfig('dark', v)} min={0} max={1} step={0.01} />
                  <SliderControl label="Diffuse" value={config.diffuse} onChange={(v) => updateConfig('diffuse', v)} min={0} max={3} step={0.01} />
                  <SliderControl label="Map Samples" value={config.mapSamples} onChange={(v) => updateConfig('mapSamples', v)} min={1000} max={40000} step={1000} />
                  <SliderControl label="Map Brightness" value={config.mapBrightness} onChange={(v) => updateConfig('mapBrightness', v)} min={0} max={12} step={0.1} />
                </div>
              </>
            )}
          </div>

          <div className="h-px bg-white/10 w-full" />

          {/* Meridian Lines */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider">Meridian Lines</h3>
            
            <div className="flex items-center justify-between">
              <label className="text-neutral-300 font-medium text-sm">Show Meridian Lines</label>
              <button 
                onClick={() => updateConfig('showGraticule', !config.showGraticule)}
                className={`w-10 h-6 rounded-full transition-colors relative ${config.showGraticule ? 'bg-white' : 'bg-neutral-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-neutral-900 absolute top-1 transition-transform ${config.showGraticule ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>

            {config.showGraticule && (
              <div className="pt-2 space-y-4">
                <SliderControl label="Lines Size (Scale)" value={config.graticuleScale} onChange={(v) => updateConfig('graticuleScale', v)} min={0.8} max={1.2} step={0.001} />

                <div className="flex justify-between text-sm items-center">
                  <label className="text-neutral-300 font-medium">Lines Color</label>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500 font-mono text-xs uppercase">{config.graticuleColor}</span>
                    <input type="color" value={config.graticuleColor} onChange={(e) => updateConfig('graticuleColor', e.target.value)} className="color-picker" />
                  </div>
                </div>

                <SliderControl label="Lines Opacity" value={config.graticuleOpacity} onChange={(v) => updateConfig('graticuleOpacity', v)} min={0} max={1} step={0.05} />
              </div>
            )}
          </div>

          <div className="h-px bg-white/10 w-full" />

          {/* Land Outline */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider">Land Outline</h3>
            
            <div className="flex items-center justify-between">
              <label className="text-neutral-300 font-medium text-sm">Show Land Outline</label>
              <button 
                onClick={() => updateConfig('showLandOutline', !config.showLandOutline)}
                className={`w-10 h-6 rounded-full transition-colors relative ${config.showLandOutline ? 'bg-white' : 'bg-neutral-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-neutral-900 absolute top-1 transition-transform ${config.showLandOutline ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>

            {config.showLandOutline && (
              <div className="pt-2 space-y-4">
                <SliderControl label="Outline Size (Scale)" value={config.landOutlineScale} onChange={(v) => updateConfig('landOutlineScale', v)} min={0.8} max={1.2} step={0.001} />

                <div className="flex justify-between text-sm items-center">
                  <label className="text-neutral-300 font-medium">Outline Color</label>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500 font-mono text-xs uppercase">{config.landOutlineColor}</span>
                    <input type="color" value={config.landOutlineColor} onChange={(e) => updateConfig('landOutlineColor', e.target.value)} className="color-picker" />
                  </div>
                </div>

                <SliderControl label="Outline Opacity" value={config.landOutlineOpacity} onChange={(v) => updateConfig('landOutlineOpacity', v)} min={0} max={1} step={0.05} />
              </div>
            )}
          </div>

          <div className="h-px bg-white/10 w-full" />

          {/* Markers */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider">Markers</h3>
              <button 
                onClick={handleAddMarker}
                className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-md text-neutral-300 transition-colors"
                title="Add Marker"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="flex items-center justify-between pb-2">
              <label className="text-neutral-300 font-medium text-sm">Pulse Animation</label>
              <button 
                onClick={() => updateConfig('pulseMarkers', !config.pulseMarkers)}
                className={`w-10 h-6 rounded-full transition-colors relative ${config.pulseMarkers ? 'bg-white' : 'bg-neutral-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-neutral-900 absolute top-1 transition-transform ${config.pulseMarkers ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex justify-between text-sm items-center pb-2">
              <label className="text-neutral-300 font-medium">Marker Color</label>
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 font-mono text-xs uppercase">{config.markerColor}</span>
                <input type="color" value={config.markerColor} onChange={(e) => updateConfig('markerColor', e.target.value)} className="color-picker" />
              </div>
            </div>
            
            <div className="space-y-3">
              {markers.map((marker, index) => (
                <div key={index} className="bg-neutral-800/50 p-3 rounded-lg border border-white/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Marker {index + 1}</span>
                    <button 
                      onClick={() => handleDeleteMarker(index)}
                      className="text-neutral-500 hover:text-red-400 transition-colors"
                      title="Delete Marker"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-500 uppercase">Label</label>
                    <input 
                      type="text" 
                      value={marker.label || ''} 
                      onChange={(e) => handleUpdateMarker(index, 'label', e.target.value)}
                      placeholder="e.g. New York"
                      className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm text-neutral-200 focus:outline-none focus:border-neutral-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-500 uppercase">Lat</label>
                      <input 
                        type="number" 
                        value={marker.location[0]} 
                        onChange={(e) => handleUpdateMarker(index, 'lat', parseFloat(e.target.value) || 0)}
                        className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm text-neutral-200 focus:outline-none focus:border-neutral-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-500 uppercase">Lng</label>
                      <input 
                        type="number" 
                        value={marker.location[1]} 
                        onChange={(e) => handleUpdateMarker(index, 'lng', parseFloat(e.target.value) || 0)}
                        className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm text-neutral-200 focus:outline-none focus:border-neutral-500"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="text-[10px] text-neutral-500 uppercase">Size</label>
                      <span className="text-[10px] text-neutral-500 font-mono">{marker.size.toFixed(3)}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.01" 
                      max="0.3" 
                      step="0.01" 
                      value={marker.size} 
                      onChange={(e) => handleUpdateMarker(index, 'size', parseFloat(e.target.value))}
                      className="w-full accent-white"
                    />
                  </div>
                </div>
              ))}
              
              {markers.length === 0 && (
                <p className="text-sm text-neutral-500 text-center py-4">No markers added.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Globe Display */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden min-h-[500px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="w-full max-w-3xl aspect-square relative z-10">
          <InteractiveGlobe 
            theta={config.theta}
            dark={config.dark}
            diffuse={config.diffuse}
            mapSamples={config.mapSamples}
            mapBrightness={config.showDots ? config.mapBrightness : 0}
            baseColor={config.showDots ? hexToRgb(config.baseColor) : (config.dark > 0.5 ? [0, 0, 0] : [1, 1, 1])}
            markerColor={hexToRgb(config.markerColor)}
            glowColor={hexToRgb(config.glowColor).map(v => v * config.glowIntensity) as [number, number, number]}
            markers={markers}
            scale={config.scale}
            offset={[config.offsetX, config.offsetY]}
            rotationSpeed={config.rotationSpeed}
            dragSensitivity={config.dragSensitivity}
            enableFadeMask={config.enableFadeMask}
            showGraticule={config.showGraticule}
            graticuleColor={config.graticuleColor}
            graticuleOpacity={config.graticuleOpacity}
            graticuleScale={config.graticuleScale}
            showLandOutline={config.showLandOutline}
            landOutlineColor={config.landOutlineColor}
            landOutlineOpacity={config.landOutlineOpacity}
            landOutlineScale={config.landOutlineScale}
            pulseMarkers={config.pulseMarkers}
          />
        </div>
      </div>

      {/* Export Code Modal */}
      {showExportModal && (
        <ExportModal 
          config={config} 
          markers={markers} 
          onClose={() => setShowExportModal(false)} 
        />
      )}
    </div>
  );
}
