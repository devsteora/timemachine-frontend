'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import apiClient from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { UserPlus, Activity, Calendar, Clock, ShieldCheck, Network } from 'lucide-react';

interface TeamMember {
  id: string;
  email: string;
  role: string;
  daysWorkedThisWeek: number;
  totalActiveHours: string;
  totalIdleHours: string;
  lastActive: string;
}

interface DirectoryUser {
  id: string;
  email: string;
  role: string;
  manager_id: string | null;
  team: string | null;
}

const TEAM_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: '— Unassigned —' },
  { value: 'DEV', label: 'Dev' },
  { value: 'QC', label: 'QC' },
  { value: 'AV', label: 'AV' },
  { value: 'TRANSCRIPTION', label: 'Transcription' },
  { value: 'ACCOUNTS', label: 'Accounts' },
  { value: 'ORDER_DESK', label: 'Order Desk' },
  { value: 'HR', label: 'HR' },
  { value: 'ADMIN', label: 'Admin' },
];

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'access' | 'reporting'>('overview');
  
  // State for Access Management Form
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('EMPLOYEE');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [teamData, setTeamData] = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [teamError, setTeamError] = useState<string | null>(null);

  const [directoryUsers, setDirectoryUsers] = useState<DirectoryUser[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const [directoryError, setDirectoryError] = useState<string | null>(null);
  const [managerSavingId, setManagerSavingId] = useState<string | null>(null);
  const [teamSavingId, setTeamSavingId] = useState<string | null>(null);

  // Security Guard: Only allow ADMIN users to view this page
  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      setTeamLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setTeamLoading(true);
      setTeamError(null);
      try {
        const { data } = await apiClient.get<
          {
            id: string;
            email: string;
            role: string;
            days_worked_this_week: number;
            total_active_hours: string;
            total_idle_hours: string;
            last_active: string;
          }[]
        >('/admin/users/stats');
        if (cancelled) return;
        setTeamData(
          data.map((row) => ({
            id: row.id,
            email: row.email,
            role: row.role,
            daysWorkedThisWeek: row.days_worked_this_week,
            totalActiveHours: row.total_active_hours,
            totalIdleHours: row.total_idle_hours,
            lastActive: row.last_active,
          }))
        );
      } catch (e: unknown) {
        if (cancelled) return;
        const msg =
          e && typeof e === 'object' && 'response' in e
            ? (e as { response?: { data?: { detail?: string } } }).response?.data
                ?.detail
            : undefined;
        setTeamError(
          typeof msg === 'string' ? msg : 'Failed to load team stats.'
        );
        setTeamData([]);
      } finally {
        if (!cancelled) setTeamLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  useEffect(() => {
    if (user?.role !== 'ADMIN' || activeTab !== 'reporting') return;
    let cancelled = false;
    (async () => {
      setDirectoryLoading(true);
      setDirectoryError(null);
      try {
        const { data } = await apiClient.get<
          {
            id: string;
            email: string;
            role: string;
            manager_id: string | null;
            team: string | null;
          }[]
        >('/admin/users');
        if (cancelled) return;
        setDirectoryUsers(data);
      } catch (e: unknown) {
        if (cancelled) return;
        const msg =
          e && typeof e === 'object' && 'response' in e
            ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail
            : undefined;
        setDirectoryError(typeof msg === 'string' ? msg : 'Failed to load users.');
        setDirectoryUsers([]);
      } finally {
        if (!cancelled) setDirectoryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.role, activeTab]);

  if (user?.role !== 'ADMIN') return null; // Prevent UI flicker before redirect

  const handleCreateAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // Reusing the secure register endpoint to provision accounts
      await apiClient.post('/auth/register', { 
        email: newEmail, 
        password: newPassword,
        role: newRole 
      });
      
      setMessage({ text: 'User access provisioned successfully.', type: 'success' });
      setNewEmail('');
      setNewPassword('');
      setNewRole('EMPLOYEE');
    } catch (err: any) {
      setMessage({ text: err.response?.data?.detail || 'Failed to create user.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignManager = async (employeeId: string, managerId: string) => {
    setManagerSavingId(employeeId);
    try {
      await apiClient.patch(`/admin/users/${employeeId}/manager`, {
        manager_id: managerId === '' ? null : managerId,
      });
      setDirectoryUsers((prev) =>
        prev.map((u) =>
          u.id === employeeId
            ? { ...u, manager_id: managerId === '' ? null : managerId }
            : u
        )
      );
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      alert(typeof msg === 'string' ? msg : 'Could not update reporting manager.');
    } finally {
      setManagerSavingId(null);
    }
  };

  const handleAssignTeam = async (userId: string, teamCode: string) => {
    setTeamSavingId(userId);
    try {
      await apiClient.patch(`/admin/users/${userId}/team`, {
        team: teamCode === '' ? null : teamCode,
      });
      setDirectoryUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, team: teamCode === '' ? null : teamCode }
            : u
        )
      );
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      alert(typeof msg === 'string' ? msg : 'Could not update team.');
    } finally {
      setTeamSavingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Control Center</h1>
        <p className="text-gray-500 mt-1">Manage team access and monitor organization-wide productivity.</p>
      </header>

      {/* Custom Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'overview' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center space-x-2"><Activity size={16} /> <span>Team Overview</span></div>
        </button>
        <button 
          onClick={() => setActiveTab('access')}
          className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'access' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center space-x-2"><ShieldCheck size={16} /> <span>Manage Access</span></div>
        </button>
        <button 
          onClick={() => setActiveTab('reporting')}
          className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'reporting' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center space-x-2"><Network size={16} /> <span>Reporting</span></div>
        </button>
      </div>

      {/* TAB 1: TEAM OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {teamLoading && (
            <p className="p-4 text-sm text-gray-500">Loading team data…</p>
          )}
          {teamError && !teamLoading && (
            <p className="p-4 text-sm text-red-600">{teamError}</p>
          )}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                <th className="p-4 font-medium">Employee</th>
                <th className="p-4 font-medium">Days Worked (This Week)</th>
                <th className="p-4 font-medium">Active Hours</th>
                <th className="p-4 font-medium">Idle Hours</th>
                <th className="p-4 font-medium">Last Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teamData.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{member.email}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{member.role}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Calendar size={14} className="text-gray-400" />
                      <span>{member.daysWorkedThisWeek} / 5 Days</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2 text-green-600 font-medium">
                      <Clock size={14} />
                      <span>{member.totalActiveHours}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{member.totalIdleHours}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${member.lastActive === 'Active Now' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {member.lastActive}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: ACCESS MANAGEMENT */}
      {activeTab === 'access' && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-2xl">
          <div className="flex items-center space-x-3 mb-6 border-b border-gray-100 pb-4">
            <div className="p-2 bg-blue-50 text-accent rounded-lg">
              <UserPlus size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Provision New Employee</h2>
              <p className="text-sm text-gray-500">Create login credentials and assign system roles.</p>
            </div>
          </div>

          {message.text && (
            <div className={`p-4 rounded-md text-sm mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleCreateAccess} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Email</label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-accent outline-none text-gray-900"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="employee@enterprise.com"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-accent outline-none text-gray-900"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">System Role</label>
                <select
                  className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-accent outline-none text-gray-900 bg-white"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="EMPLOYEE">Employee (Monitored)</option>
                  <option value="MANAGER">Manager (Can view team)</option>
                  <option value="ADMIN">Admin (Full access)</option>
                </select>
              </div>
            </div>

            <Button type="submit" className="w-full mt-4" isLoading={loading}>
              Create User Access
            </Button>
          </form>
        </div>
      )}

      {activeTab === 'reporting' && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Reporting managers</h2>
            <p className="text-sm text-gray-500">
              Assign each employee&apos;s manager so they can send EOD updates and mail from the app.
            </p>
          </div>
          {directoryLoading && (
            <p className="p-4 text-sm text-gray-500">Loading directory…</p>
          )}
          {directoryError && !directoryLoading && (
            <p className="p-4 text-sm text-red-600">{directoryError}</p>
          )}
          {!directoryLoading && !directoryError && (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-sm text-gray-600">
                  <th className="p-4 font-medium">Employee</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Team</th>
                  <th className="p-4 font-medium">Reporting manager</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {directoryUsers.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{row.email}</div>
                    </td>
                    <td className="p-4 text-gray-600">{row.role}</td>
                    <td className="p-4">
                      <select
                        className="w-full max-w-xs rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-900"
                        value={row.team ?? ''}
                        disabled={teamSavingId === row.id}
                        onChange={(e) =>
                          void handleAssignTeam(row.id, e.target.value)
                        }
                      >
                        {TEAM_OPTIONS.map((opt) => (
                          <option key={opt.value || 'unset'} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <select
                        className="w-full max-w-md rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-900"
                        value={row.manager_id ?? ''}
                        disabled={managerSavingId === row.id}
                        onChange={(e) =>
                          void handleAssignManager(row.id, e.target.value)
                        }
                      >
                        <option value="">— None —</option>
                        {directoryUsers
                          .filter((u) => u.id !== row.id)
                          .map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.email}
                            </option>
                          ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}