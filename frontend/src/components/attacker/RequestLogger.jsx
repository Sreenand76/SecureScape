import React, { useState } from 'react';
import { FiInfo, FiTrash2, FiFilter, FiChevronDown, FiChevronUp, FiClock } from 'react-icons/fi';
import { useRequestLogger } from '../../contexts/RequestLoggerContext';
import { useSecurityMode } from '../../contexts/SecurityModeContext';

const RequestLogger = () => {
  const { requests, clearLogs } = useRequestLogger();
  const { mode } = useSecurityMode();
  const [expandedLogs, setExpandedLogs] = useState(new Set());
  const [filter, setFilter] = useState('all'); // all, success, error, pending

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    if (filter === 'success') return req.status >= 200 && req.status < 300;
    if (filter === 'error') return req.status === 'error' || req.status >= 400;
    if (filter === 'pending') return req.status === 'pending';
    return true;
  });

  const toggleExpand = (id) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getStatusColor = (status) => {
    if (status === 'pending') return 'text-yellow-400';
    if (status === 'error' || (typeof status === 'number' && status >= 400)) return 'text-red-400';
    if (typeof status === 'number' && status >= 200 && status < 300) return 'text-green-400';
    return 'text-gray-400';
  };

  const getStatusBadge = (status) => {
    if (status === 'pending') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    if (status === 'error' || (typeof status === 'number' && status >= 400)) {
      return 'bg-red-500/20 text-red-400 border-red-500/50';
    }
    if (typeof status === 'number' && status >= 200 && status < 300) {
      return 'bg-green-500/20 text-green-400 border-green-500/50';
    }
    return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-100">Request Logger</h3>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All</option>
            <option value="success">Success</option>
            <option value="error">Errors</option>
            <option value="pending">Pending</option>
          </select>
          {requests.length > 0 && (
            <button
              onClick={clearLogs}
              className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-red-400"
              aria-label="Clear logs"
              title="Clear all logs"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredRequests.length === 0 ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm py-8 justify-center">
            <FiInfo className="w-4 h-4" />
            <span>
              {requests.length === 0 
                ? 'No requests logged yet. API calls will appear here.' 
                : 'No requests match the current filter.'}
            </span>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isExpanded = expandedLogs.has(req.id);
            return (
              <div
                key={req.id}
                className="bg-gray-700 rounded p-2 text-xs font-mono border border-gray-600"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-semibold ${getStatusColor(req.status)}`}>
                        {req.method}
                      </span>
                      <span className="text-gray-300 truncate">{req.fullUrl || req.url}</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs border ${getStatusBadge(req.status)}`}>
                        {req.status === 'pending' ? 'PENDING' : 
                         req.status === 'error' ? 'ERROR' : 
                         typeof req.status === 'number' ? req.status : 'UNKNOWN'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400 text-xs">
                      <span className="flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        {req.timestamp}
                      </span>
                      {req.responseTime && (
                        <span className="text-green-400">{req.responseTime}ms</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleExpand(req.id)}
                    className="p-1 hover:bg-gray-600 rounded transition-colors text-gray-400"
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? (
                      <FiChevronUp className="w-4 h-4" />
                    ) : (
                      <FiChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-2 pt-2 border-t border-gray-600 space-y-2">
                    {req.params && Object.keys(req.params).length > 0 && (
                      <div>
                        <div className="text-gray-400 text-xs mb-1">Query Params:</div>
                        <pre className="bg-gray-900 p-2 rounded text-xs text-gray-300 overflow-x-auto">
                          {JSON.stringify(req.params, null, 2)}
                        </pre>
                      </div>
                    )}
                    {req.status === 'pending' && req.data && (
                      <div>
                        <div className="text-gray-400 text-xs mb-1">Request Body:</div>
                        <pre className="bg-gray-900 p-2 rounded text-xs text-gray-300 overflow-x-auto max-h-40 overflow-y-auto">
                          {JSON.stringify(req.data, null, 2)}
                        </pre>
                      </div>
                    )}
                    {req.status !== 'pending' && req.data && (
                      <div>
                        <div className="text-gray-400 text-xs mb-1">Response Data:</div>
                        <pre className="bg-gray-900 p-2 rounded text-xs text-gray-300 overflow-x-auto max-h-40 overflow-y-auto">
                          {JSON.stringify(req.data, null, 2)}
                        </pre>
                      </div>
                    )}
                    {req.error && (
                      <div>
                        <div className="text-red-400 text-xs mb-1">Error:</div>
                        <div className="bg-gray-900 p-2 rounded text-xs text-red-300">
                          {req.error}
                        </div>
                      </div>
                    )}
                    {req.statusText && (
                      <div className="text-gray-400 text-xs">
                        Status: {req.statusText}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {requests.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-400 text-center">
          Showing {filteredRequests.length} of {requests.length} requests
        </div>
      )}
    </div>
  );
};

export default RequestLogger;
