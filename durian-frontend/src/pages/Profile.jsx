import { useState, useEffect } from 'react';
import api from '../utils/api';
import { User, Mail, Phone, Camera, Lock, Activity, LogIn, Save, X, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user: authUser, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [selectedTab, setSelectedTab] = useState('profile'); // profile, activity, logins

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profile');
      setProfileData(response.data);
      setFormData({
        name: response.data.user.name,
        email: response.data.user.email,
        phone: response.data.user.phone || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      alert('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put('/profile', formData);
      setUser(response.data.user);
      setProfileData({ ...profileData, user: response.data.user });
      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await api.post('/profile/change-password', passwordData);
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
      setShowPasswordForm(false);
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      alert(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profile_picture', file);

    try {
      const response = await api.post('/profile/upload-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(response.data.user);
      setProfileData({ ...profileData, user: response.data.user });
      alert('Profile picture uploaded successfully!');
    } catch (error) {
      console.error('Error uploading picture:', error);
      alert('Failed to upload picture');
    }
  };

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="text-primary-600" size={28} />
          Profile Saya
        </h1>
        <p className="text-gray-600">Manage your account settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setSelectedTab('profile')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            selectedTab === 'profile'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setSelectedTab('activity')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            selectedTab === 'activity'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Activity
        </button>
        <button
          onClick={() => setSelectedTab('logins')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            selectedTab === 'logins'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Login History
        </button>
      </div>

      {/* Profile Tab */}
      {selectedTab === 'profile' && (
        <div className="space-y-6">
          {/* Profile Picture Card */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Profile Picture</h3>
            <div className="flex items-center gap-6">
              <div className="relative">
                {profileData.user.profile_picture ? (
                  <img
                    src={`http://localhost:8000/storage/${profileData.user.profile_picture}`}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center">
                    <User size={40} className="text-primary-600" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700">
                  <Camera size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePictureUpload}
                  />
                </label>
              </div>
              <div>
                <p className="font-medium text-gray-900">{profileData.user.name}</p>
                <p className="text-sm text-gray-600">{profileData.user.role}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Click camera icon to upload new picture (Max 2MB)
                </p>
              </div>
            </div>
          </div>

          {/* Profile Info Card */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Profile Information</h3>
              {!editMode && (
                <button onClick={() => setEditMode(true)} className="btn-secondary text-sm">
                  Edit Profile
                </button>
              )}
            </div>

            {editMode ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="label">Name</label>
                  <div className="relative">
                    <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Phone</label>
                  <div className="relative">
                    <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-field pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary flex items-center gap-2">
                    <Save size={18} />
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setFormData({
                        name: profileData.user.name,
                        email: profileData.user.email,
                        phone: profileData.user.phone || '',
                      });
                    }}
                    className="btn-secondary"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User size={20} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium">{profileData.user.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail size={20} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{profileData.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone size={20} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium">{profileData.user.phone || 'Not set'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Statistics Card */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Your Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">Total Activities</p>
                <p className="text-2xl font-bold">{profileData.statistics.total_activities}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600">Total Logins</p>
                <p className="text-2xl font-bold">{profileData.statistics.login_count}</p>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lock size={20} className="text-primary-600" />
                Change Password
              </h3>
              {!showPasswordForm && (
                <button onClick={() => setShowPasswordForm(true)} className="btn-secondary text-sm">
                  Change Password
                </button>
              )}
            </div>

            {showPasswordForm && (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="label">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    className="input-field"
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.new_password_confirmation}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary flex items-center gap-2">
                    <Lock size={18} />
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({
                        current_password: '',
                        new_password: '',
                        new_password_confirmation: '',
                      });
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {selectedTab === 'activity' && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity size={20} className="text-primary-600" />
            Recent Activity
          </h3>
          <div className="space-y-2">
            {profileData.statistics.recent_activities.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No activities yet</p>
            ) : (
              profileData.statistics.recent_activities.map((activity) => (
                <div key={activity.id} className="p-3 border border-gray-200 rounded-lg">
                  <p className="font-medium text-sm">{activity.action.replace('_', ' ').toUpperCase()}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Login History Tab */}
      {selectedTab === 'logins' && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <LogIn size={20} className="text-primary-600" />
            Login History
          </h3>
          {profileData.statistics.last_login && (
            <div className="p-4 bg-green-50 rounded-lg mb-4">
              <p className="text-sm text-green-600">Last successful login</p>
              <p className="font-medium">{new Date(profileData.statistics.last_login.created_at).toLocaleString()}</p>
              <p className="text-sm text-gray-600">IP: {profileData.statistics.last_login.ip_address}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
