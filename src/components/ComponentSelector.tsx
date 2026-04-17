import React from 'react';
import type { CPU, GPU, RAM, Storage, PSU, Motherboard } from '../types';

type ComponentItem = CPU | GPU | RAM | Storage | PSU | Motherboard;

interface ComponentSelectorProps<T extends ComponentItem> {
  label: string;
  options: T[];
  value: T | null;
  onChange: (item: T | null) => void;
  getLabel: (item: T) => string;
  placeholder?: string;
}

export function ComponentSelector<T extends ComponentItem>({
  label,
  options,
  value,
  onChange,
  getLabel,
  placeholder = 'Select...',
}: ComponentSelectorProps<T>) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = options.find((o) => o.id === e.target.value) ?? null;
    onChange(selected);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <select
        value={value?.id ?? ''}
        onChange={handleChange}
        className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {getLabel(opt)}
          </option>
        ))}
      </select>
    </div>
  );
}
