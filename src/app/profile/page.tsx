"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import ConfirmDialog from "@/components/ConfirmDialog";
import api from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  profileImg?: string;
  role: 'CUSTOMER' | 'ORGANIZER';
  referralCode: string;
  referredByCode?: string;
  pointsBalance: number;
  createdAt: string;
  organizerRating?: number;
  organizerReviewCount?: number;
  referrerInfo?: {
    name: string;
    email: string;
    role: 'CUSTOMER' | 'ORGANIZER';
    profileImg?: string;
  } | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [editForm, setEditForm] = useState({
    name: "",
    profileImg: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/auth/login");
      return;
    }

    fetchProfile();
  }, [router]);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/users/profile");
      setProfile(response.data);
      setEditForm({
        name: response.data.name || "",
        profileImg: response.data.profileImg || ""
      });
    } catch (error: any) {
      console.error("Failed to fetch profile:", error);
      if (error.response?.status === 401 || error.response?.status === 404) {
        // User not found or unauthorized - redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user_profile_cache');
        window.location.href = '/auth/login';
        return;
      }
      // Handle other errors
      alert("Failed to load profile. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    
    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      
      if (selectedFile) {
        formData.append('profileImg', selectedFile);
      }
      
      const response = await api.put("/users/profile", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setProfile(response.data);
      setSelectedFile(null);
      setPreviewUrl(null);
      alert("Profile updated successfully!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords don't match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      alert("New password must be different from current password");
      return;
    }

    try {
      await api.put("/users/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      alert("Password updated successfully!");
      setShowPasswordDialog(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update password");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete("/users/profile");
      localStorage.removeItem("token");
      router.push("/");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete account");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary">
        <Navbar />
        <div className="container-section">
          <div className="text-center mb-12">
            <div className="h-16 bg-white/10 backdrop-blur-md rounded-2xl w-1/3 mx-auto mb-6 animate-pulse"></div>
            <div className="h-6 bg-white/10 backdrop-blur-md rounded w-1/2 mx-auto mb-8 animate-pulse"></div>
          </div>
          <div className="glass-card max-w-4xl mx-auto">
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-white/10 backdrop-blur-md rounded-2xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-primary">
        <Navbar />
        <div className="container-section">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
              <span className="text-6xl">⚠️</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Profile Not Found</h1>
            <p className="text-gray-300 text-xl">Unable to load your profile information</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 container-hero">
          <div className="text-center mb-12 sm:mb-16">
            <div className="hero-badge mb-6 sm:mb-8">
              <span className="text-yellow-400 mr-2 sm:mr-3 text-sm sm:text-base">👤</span>
              <span className="text-white text-sm sm:text-lg font-medium">User Profile</span>
            </div>
            
            <h1 className="hero-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6">
              <span className="text-gradient">My Profile</span>
            </h1>
            
            <p className="hero-subtitle text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto px-4">
              Manage your account settings and personal information
            </p>
          </div>
        </div>
      </div>

      <div className="container-section">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="glass-card mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 gradient-secondary rounded-full flex items-center justify-center shadow-lg">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover"
                    />
                  ) : profile.profileImg ? (
                    <img
                      src={profile.profileImg}
                      alt={profile.name}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl sm:text-6xl font-bold text-white">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-xs sm:text-sm font-bold text-black">
                    {profile.role === 'ORGANIZER' ? '🎪' : '👤'}
                  </span>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{profile.name}</h2>
                <p className="text-gray-300 text-base sm:text-lg mb-4 break-words">{profile.email}</p>
                <div className="flex flex-wrap gap-2 sm:gap-3 justify-center md:justify-start">
                  <span className="badge-primary text-xs sm:text-sm">
                    {profile.role === 'ORGANIZER' ? 'Event Organizer' : 'Customer'}
                  </span>
                  <span className="badge-success text-xs sm:text-sm">
                    {profile.pointsBalance} Points
                  </span>
                  {profile.role === 'ORGANIZER' && profile.organizerRating !== undefined && (
                    <span className="badge-secondary text-xs sm:text-sm">
                      ⭐ {profile.organizerRating.toFixed(1)} ({profile.organizerReviewCount} reviews)
                    </span>
                  )}
                  <span className="badge-secondary text-xs sm:text-sm">
                    Member since {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Edit Profile */}
            <div className="glass-card">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                <span className="mr-2 sm:mr-3 text-lg sm:text-xl">✏️</span>
                Edit Profile
              </h3>
              
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="form-input"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Profile Picture</label>
                  
                  {/* Current Profile Image Preview */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 gradient-secondary rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-20 h-20 rounded-full object-cover"
                          />
                        ) : profile.profileImg ? (
                          <img
                            src={profile.profileImg}
                            alt={profile.name}
                            className="w-20 h-20 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-white">
                            {profile.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">Current Profile Picture</p>
                        <p className="text-gray-400 text-sm">
                          {previewUrl ? "New image selected" : profile.profileImg ? "Custom image" : "Default avatar"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="profile-image-upload"
                    />
                    <label
                      htmlFor="profile-image-upload"
                      className="flex items-center justify-center w-full h-32 border-2 border-dashed border-purple-500/30 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                          📸
                        </div>
                        <p className="text-white font-medium">
                          {selectedFile ? selectedFile.name : "Click to upload image"}
                        </p>
                        <p className="text-gray-400 text-sm">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Remove Image Button */}
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="mt-2 w-full py-2 bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-300 font-semibold rounded-xl hover:bg-red-500/20 transition-all duration-300"
                    >
                      🗑️ Remove Selected Image
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="btn-primary w-full py-4"
                >
                  {updating ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    "Update Profile"
                  )}
                </button>
              </form>
            </div>

            {/* Account Actions */}
            <div className="glass-card">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                <span className="mr-2 sm:mr-3 text-lg sm:text-xl">⚙️</span>
                Account Actions
              </h3>
              
              <div className="space-y-4">
                <button
                  onClick={() => setShowPasswordDialog(true)}
                  className="btn-secondary w-full py-4"
                >
                  🔐 Change Password
                </button>
                
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="w-full py-4 bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-300 font-semibold rounded-2xl hover:bg-red-500/20 transition-all duration-300"
                >
                  🗑️ Delete Account
                </button>
              </div>
            </div>
          </div>

          {/* Referral Information */}
          <div className="glass-card mt-6 sm:mt-8">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
              <span className="mr-2 sm:mr-3 text-lg sm:text-xl">🎁</span>
              Referral Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20">
                <h4 className="text-base sm:text-lg font-semibold text-white mb-3">Your Referral Code</h4>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                  <code className="flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-white/10 backdrop-blur-md rounded-xl text-yellow-400 font-mono text-sm sm:text-lg break-all">
                    {profile.referralCode}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(profile.referralCode)}
                    className="btn-primary px-4 py-2 sm:py-3 text-sm sm:text-base"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-gray-300 text-xs sm:text-sm mt-3">
                  Share this code with friends to earn bonus points!
                </p>
              </div>

              {profile.referrerInfo && (
                <div className="p-4 sm:p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-500/20">
                  <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Referred By</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 gradient-secondary rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {profile.referrerInfo.profileImg ? (
                          <img
                            src={profile.referrerInfo.profileImg}
                            alt={profile.referrerInfo.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm sm:text-lg font-bold text-white">
                            {profile.referrerInfo.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-base sm:text-lg truncate">{profile.referrerInfo.name}</p>
                        <p className="text-gray-300 text-xs sm:text-sm truncate">{profile.referrerInfo.email}</p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <span className="badge-secondary text-xs sm:text-sm">
                        {profile.referrerInfo.role === 'ORGANIZER' ? 'Event Organizer' : 'Customer'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Dialog */}
      {showPasswordDialog && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPasswordDialog(false);
            }
          }}
        >
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 sm:top-20 left-4 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
            <div className="absolute top-20 sm:top-40 right-4 sm:right-10 w-48 h-48 sm:w-72 sm:h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-4 sm:-bottom-8 left-8 sm:left-20 w-48 h-48 sm:w-72 sm:h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="glass-card w-full max-w-sm sm:max-w-md relative z-10 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setShowPasswordDialog(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300"
            >
              <span className="text-white text-lg">×</span>
            </button>

            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 gradient-secondary rounded-3xl flex items-center justify-center shadow-lg">
                <span className="text-2xl sm:text-3xl">🔑</span>
              </div>
              <h2 className="hero-title text-2xl sm:text-3xl mb-3 sm:mb-4">Change Password</h2>
              <p className="hero-subtitle text-base sm:text-lg">Update your account password securely</p>
            </div>

            {/* Form */}
            <form onSubmit={(e) => { e.preventDefault(); handlePasswordChange(); }} className="space-y-4 sm:space-y-6">
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="form-input"
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="form-input"
                  placeholder="Enter new password (min. 6 characters)"
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="form-input"
                  placeholder="Confirm new password"
                  required
                />
              </div>

              {/* Security Tips */}
              <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20">
                <h3 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3 text-center">Password Security Tips</h3>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-300">
                  <div className="flex items-start space-x-2">
                    <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                    <span>Use at least 8 characters with letters, numbers, and symbols</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                    <span>Avoid personal information or common words</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                    <span>Don't reuse passwords from other accounts</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordDialog(false)}
                  className="btn-secondary flex-1 py-3 sm:py-4 text-base sm:text-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 py-3 sm:py-4 text-base sm:text-lg"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone."
        confirmText="Delete Account"
        type="danger"
      />
    </div>
  );
}
