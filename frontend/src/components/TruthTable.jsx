import React, { useMemo } from 'react';
import { evaluateCircuit } from '../utils/circuitLogic';

const TruthTable = ({ gates, wires }) => {
  const inputGates = gates.filter(g => g.type === 'INPUT');
  const outputGates = gates.filter(g => g.type === 'OUTPUT');

  const rows = useMemo(() => {
    if (inputGates.length === 0 || outputGates.length === 0) return [];
    const n = inputGates.length;
    if (n > 6) return []; // avoid huge tables

    return Array.from({ length: 2 ** n }).map((_, rowIdx) => {
      const inputStates = inputGates.map((g, i) => (rowIdx >> (n - 1 - i)) & 1);

      const testGates = gates.map(g => {
        const idx = inputGates.findIndex(ig => ig.id === g.id);
        return idx >= 0 ? { ...g, state: inputStates[idx] } : g;
      });

      const result = evaluateCircuit(testGates, wires);
      const outputVals = outputGates.map(og => result.gateValues[og.id] ?? '?');
      return { inputs: inputStates, outputs: outputVals };
    });
  }, [gates, wires, inputGates.length, outputGates.length]);

  if (inputGates.length === 0) return (
    <div className="text-xs text-slate-600 italic p-3">Add INPUT gates to see the truth table.</div>
  );
  if (outputGates.length === 0) return (
    <div className="text-xs italic p-3" style={{ color: 'var(--c-text-muted)' }}>Add an OUTPUT gate to see results.</div>
  );
  if (inputGates.length > 6) return (
    <div className="text-xs p-3 text-center" style={{ color: 'var(--c-text-muted)' }}>Truth table limited to ≤ 6 inputs.</div>
  );

  return (
    <div className="overflow-x-auto overflow-y-auto max-h-[300px] hidden-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
      <table className="w-full text-[11px] font-mono border-collapse min-w-full table-auto">
        <thead className="sticky top-0 z-10" style={{ background: 'var(--c-surface-2)' }}>
          <tr>
            {inputGates.map((g, i) => (
              <th key={g.id} className="px-3 py-2 text-center font-bold uppercase tracking-wider whitespace-nowrap"
                style={{ color: 'var(--neon-amber)', borderBottom: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.06)' }}>
                I{i + 1}
              </th>
            ))}
            <th className="px-1.5 py-2" style={{ background: 'var(--c-border-dim)', borderBottom: '1px solid var(--c-border-dim)' }} />
            {outputGates.map((g, i) => (
              <th key={g.id} className="px-3 py-2 text-center font-bold uppercase tracking-wider whitespace-nowrap"
                style={{ color: 'var(--neon-red)', borderBottom: '1px solid rgba(255,51,102,0.2)', background: 'rgba(255,51,102,0.06)' }}>
                O{i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            const allHigh = row.outputs.every(v => v === 1);
            return (
              <tr key={ri} className="transition-colors"
                style={{ background: allHigh ? 'rgba(57,255,20,0.08)' : ri % 2 === 0 ? 'var(--c-surface-2)' : 'transparent' }}>
                {row.inputs.map((v, i) => (
                  <td key={i} className="px-3 py-1.5 text-center font-semibold whitespace-nowrap"
                    style={{ color: v === 1 ? 'var(--neon-amber)' : 'var(--c-text-dim)', borderRight: '1px solid var(--c-border-dim)' }}>
                    {v}
                  </td>
                ))}
                <td className="px-1 text-center opacity-40" style={{ background: 'var(--c-surface-2)', borderRight: '1px solid var(--c-border-dim)' }}>→</td>
                {row.outputs.map((v, i) => (
                  <td key={i} className="px-3 py-1.5 text-center font-black whitespace-nowrap"
                    style={{ color: v === 1 ? 'var(--neon-green)' : v === 0 ? 'var(--neon-red)' : 'var(--c-text-dim)' }}>
                    {v === '?' ? '?' : v}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length === 0 && (
        <p className="text-xs italic p-4 text-center" style={{ color: 'var(--c-text-muted)' }}>Wire your circuit to see outputs.</p>
      )}
    </div>
  );
};

export default TruthTable;
