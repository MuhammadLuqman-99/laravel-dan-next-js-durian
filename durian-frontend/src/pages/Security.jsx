import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Shield, AlertTriangle, Activity, Lock, Unlock, Trash2, Eye, Ban, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Security = () => {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [blockedIps, setBlockedIps] = useState([]);
  const [selectedTab, setSelectedTab] = useState('overview'); // overview, events, blocked
  const [days, setDays] = useState(7);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, days]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, eventsRes, blockedRes] = await Promise.all([
        api.get(`/security/statistics?days=${days}`),
        api.get('/security/events?limit=50'),
        api.get('/security/blocked-ips'),
      ]);

      setStatistics(statsRes.data);
      setRecentEvents(eventsRes.data);
      setBlockedIps(blockedRes.data);
    } catch (error) {
      console.error('Error fetching security data:', error);
      alert('Error loading security data');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockIp = async (ip) => {
    const reason = prompt(`Block IP ${ip}?\n\nEnter reason:`);
    if (!reason) return;

    try {
      await api.post('/security/block-ip', { ip_address: ip, reason });
      alert('IP blocked successfully');
      fetchData();
    } catch (error) {
      console.error('Error blocking IP:', error);
      alert('Failed to block IP');
    }
  };

  const handleUnblockIp = async (ip) => {
    if (!confirm(`Unblock IP ${ip}?`)) return;

    try {
      await api.post('/security/unblock-ip', { ip_address: ip });
      alert('IP unblocked successfully');
      fetchData();
    } catch (error) {
      console.error('Error unblocking IP:', error);
      alert('Failed to unblock IP');
    }
  };

  const handleClearLogs = async () => {
    const days = prompt('Clear logs older than how many days? (default: 90):', '90');
    if (!days) return;

    if (!confirm(`This will delete security logs older than ${days} days. Continue?`)) return;

    try {
      const response = await api.delete(`/security/clear-logs?days=${days}`);
      alert(`${response.data.deleted_count} logs cleared successfully`);
      fetchData();
    } catch (error) {
      console.error('Error clearing logs:', error);
      alert('Failed to clear logs');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'login_failed': return <XCircle size={16} className="text-red-600" />;
      case 'login_success': return <CheckCircle size={16} className="text-green-600" />;
      case 'rate_limit': return <Ban size={16} className="text-yellow-600" />;
      case 'suspicious_login': return <AlertTriangle size={16} className="text-red-600" />;
      default: return <Activity size={16} className="text-gray-600" />;
    }
  };

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="text-primary-600" size={28} />
            Security Dashboard
          </h1>
          <p className="text-gray-600">Monitor dan manage security system</p>
        </div>

        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="input-field w-auto"
        >
          <option value={1}>24 Jam</option>
          <option value={7}>7 Hari</option>
          <option value={30}>30 Hari</option>
          <option value={90}>90 Hari</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setSelectedTab('overview')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            selectedTab === 'overview'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setSelectedTab('events')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            selectedTab === 'events'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Events ({recentEvents.length})
        </button>
        <button
          onClick={() => setSelectedTab('blocked')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            selectedTab === 'blocked'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Blocked IPs ({blockedIps.length})
        </button>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && statistics && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold">{statistics.total_events}</p>
                </div>
                <Activity className="text-gray-400" size={40} />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Critical Events</p>
                  <p className="text-2xl font-bold text-red-600">{statistics.critical_events}</p>
                </div>
                <AlertTriangle className="text-red-400" size={40} />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Login Failures</p>
                  <p className="text-2xl font-bold text-yellow-600">{statistics.login_failures}</p>
                </div>
                <XCircle className="text-yellow-400" size={40} />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Blocked IPs</p>
                  <p className="text-2xl font-bold text-red-600">{statistics.blocked_ips}</p>
                </div>
                <Ban className="text-red-400" size={40} />
              </div>
            </div>
          </div>

          {/* Top Threats */}
          {statistics.top_threats && statistics.top_threats.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="text-red-600" size={20} />
                Top Threats
              </h3>
              <div className="space-y-2">
                {statistics.top_threats.map((threat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm">{threat.ip_address}</span>
                      <span className="badge badge-danger">{threat.count} events</span>
                    </div>
                    <button
                      onClick={() => handleBlockIp(threat.ip_address)}
                      className="btn-icon-danger"
                      title="Block IP"
                    >
                      <Ban size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <div className="flex gap-3">
              <button
                onClick={fetchData}
                className="btn-primary"
              >
                <Activity size={18} />
                Refresh Data
              </button>
              <button
                onClick={handleClearLogs}
                className="btn-danger"
              >
                <Trash2 size={18} />
                Clear Old Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Events Tab */}
      {selectedTab === 'events' && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Security Events</h3>
          <div className="space-y-2">
            {recentEvents.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No events recorded</p>
            ) : (
              recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getEventIcon(event.event_type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{event.event_type.replace('_', ' ').toUpperCase()}</span>
                          <span className={`badge ${getSeverityColor(event.severity)}`}>
                            {event.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                          <span className="font-mono">{event.ip_address}</span>
                          {event.user && <span>User: {event.user.name}</span>}
                          <span>{event.endpoint}</span>
                          <span>{new Date(event.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    {event.ip_address && !event.is_blocked && (
                      <button
                        onClick={() => handleBlockIp(event.ip_address)}
                        className="btn-icon-danger flex-shrink-0"
                        title="Block this IP"
                      >
                        <Ban size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Blocked IPs Tab */}
      {selectedTab === 'blocked' && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Blocked IP Addresses</h3>
          <div className="space-y-2">
            {blockedIps.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No blocked IPs</p>
            ) : (
              blockedIps.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <span className="font-mono font-medium">{item.ip_address}</span>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.event_count} events • Last seen: {new Date(item.last_seen).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnblockIp(item.ip_address)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Unlock size={16} />
                    Unblock
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Security;
