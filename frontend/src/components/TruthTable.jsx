import React, { useMemo } from 'react';
import { evaluateCircuit } from '../utils/circuitLogic';

const TruthTable = ({ gates, wires }) => {
  const inputGates  = gates.filter(g => g.type === 'INPUT');
  const outputGates = gates.filter(g => g.type === 'OUTPUT');

  const rows = useMemo(() => {
    if (inputGates.length === 0 || outputGates.length === 0) return [];
    const n = inputGates.length;
    if (n > 4) return []; // avoid huge tables

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
    <div className="text-xs text-slate-600 italic p-3">Add an OUTPUT gate to see results.</div>
  );
  if (inputGates.length > 4) return (
    <div className="text-xs text-slate-500 p-3">Truth table limited to ≤ 4 inputs.</div>
  );

  return (
    <div className="overflow-auto">
      <table className="w-full text-xs font-mono border-collapse">
        <thead>
          <tr>
            {inputGates.map((g, i) => (
              <th key={g.id} className="px-2 py-1.5 text-center font-bold uppercase tracking-wider"
                  style={{ color: 'var(--neon-amber)', borderBottom: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.06)' }}>
                I{i + 1}
              </th>
            ))}
            <th className="px-1 py-1.5" style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.06)' }} />
            {outputGates.map((g, i) => (
              <th key={g.id} className="px-2 py-1.5 text-center font-bold uppercase tracking-wider"
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
                  style={{ background: allHigh ? 'rgba(57,255,20,0.06)' : ri % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent' }}>
                {row.inputs.map((v, i) => (
                  <td key={i} className="px-2 py-1 text-center font-semibold"
                      style={{ color: v === 1 ? '#fcd34d' : 'rgba(255,255,255,0.3)', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
                    {v}
                  </td>
                ))}
                <td className="px-0.5" style={{ background: 'rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>→</td>
                {row.outputs.map((v, i) => (
                  <td key={i} className="px-2 py-1 text-center font-black"
                      style={{ color: v === 1 ? 'var(--neon-green)' : v === 0 ? 'rgba(255,51,102,0.6)' : 'rgba(255,255,255,0.3)' }}>
                    {v === '?' ? '?' : v}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length === 0 && (
        <p className="text-xs text-slate-600 italic p-3">Wire your circuit to see outputs.</p>
      )}
    </div>
  );
};

export default TruthTable;
