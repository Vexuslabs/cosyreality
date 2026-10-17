import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Clock, FileText, UserCheck } from 'lucide-react';
import { AuditLog } from '../../types';
import { getAuditLogs } from '../../services/auditService';
import { formatDateTime } from '../../utils/formatters';
import { useDocumentTitle } from '../../utils/seo';

export const AdminAuditLogsPage: React.FC = () => {
  useDocumentTitle('System Audit Trail — Cosy Reality Admin');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getAuditLogs();
        setLogs(data);
      } catch (err) {
        console.warn('Error loading audit logs:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = logs.filter((l) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (l.action || '').toLowerCase().includes(q) ||
      (l.performedByName || '').toLowerCase().includes(q) ||
      (l.collection || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-[#103858]">Security & Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log of administrative operations, status changes, and settings modifications
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by action, user or collection..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-xs sm:text-sm focus:outline-none"
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FAF8F3] border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Timestamp</th>
                <th className="py-3.5 px-4">Operator</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Collection / Target</th>
                <th className="py-3.5 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500 text-xs whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#103858]">
                      {log.performedByName || 'System'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {log.collection} {log.docId ? `(${log.docId.slice(0, 8)}...)` : ''}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                    No audit records match the query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
