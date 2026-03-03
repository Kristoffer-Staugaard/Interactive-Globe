import React from 'react';

interface SliderControlProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step: number;
}

export function SliderControl({ 
  label, 
  value, 
  onChange, 
  min, 
  max, 
  step 
}: SliderControlProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm items-center">
        <label className="text-neutral-300 font-medium">{label}</label>
        <input 
          type="number" 
          min={min} 
          max={max} 
          step={step} 
          value={value} 
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)} 
          className="w-20 bg-neutral-800 border border-white/10 rounded px-2 py-1 text-right text-neutral-300 font-mono text-xs focus:outline-none focus:border-neutral-500"
        />
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step} 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))} 
        className="w-full accent-white" 
      />
    </div>
  );
}
