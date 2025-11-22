import { useState } from 'react';
import { useAuth } from '@/firebase/AuthProvider';
import UseAxiosSecure from '@/axios/UseAxiosSecure';
import { useQuery } from '@tanstack/react-query';
import { Users, UserCheck, UserX, Mail, Calendar, Search, Filter, Eye, Edit, Trash2, Shield, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';
import notify from '@/lib/notify';
import Loader2 from '@/components/Loaders/Loader2';

interface User {
  _id: string;
  uid: string;
  email: string;
  displayName: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
  favoriteBooks?: string[];
}

export default function AdminDashboard() {
  const { dbUser } = useAuth();
  const axiosSecure = UseAxiosSecure();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const {
    data: users = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await axiosSecure.get<User[]>('/api/users');
      return res.data;
    },
  });

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.uid?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Statistics
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const userCount = users.filter((u) => u.role === 'user').length;
  const otherCount = totalUsers - adminCount - userCount;

  const handleUpdateRole = async (user: User, newRole: string) => {
    const ADMIN_EMAIL = 'naharamina68@gmail.com';
    
    // Prevent making others admin
    if (newRole === 'admin' && user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: 'Only naharamina68@gmail.com can be assigned admin role',
      });
      return;
    }

    // Prevent removing admin from authorized email
    if (newRole === 'user' && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: 'Cannot remove admin role from authorized admin account',
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Change ${user.displayName}'s role to ${newRole}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: `Yes, make ${newRole}!`,
      });

      if (result.isConfirmed) {
        const response = await axiosSecure.put(`/api/users/${user.uid}`, {
          role: newRole,
        });

        if (response.data) {
          await refetch();
          notify.success(`User role updated to ${newRole}`);
          Swal.fire({
            title: 'Success!',
            text: `The user's role has been changed to ${newRole}.`,
            icon: 'success',
          });
        }
      }
    } catch (error: any) {
      console.error('Error updating user role:', error);
      notify.error(error?.response?.data?.message || 'Failed to update user role');
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error?.response?.data?.message || 'Something went wrong!',
      });
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Delete user ${user.displayName}? This action cannot be undone!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
      });

      if (result.isConfirmed) {
        await axiosSecure.delete(`/api/users/${user.uid}`);
        await refetch();
        notify.success('User deleted successfully');
        Swal.fire({
          title: 'Deleted!',
          text: 'The user has been deleted.',
          icon: 'success',
        });
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      notify.error(error?.response?.data?.message || 'Failed to delete user');
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error?.response?.data?.message || 'Something went wrong!',
      });
    }
  };

  const handleViewUserDetails = (user: User) => {
    setSelectedUser(user);
    Swal.fire({
      title: `<strong>${user.displayName}</strong>`,
      html: `
        <div style="text-align: left; margin-top: 20px;">
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>UID:</strong> ${user.uid}</p>
          <p><strong>Role:</strong> <span style="text-transform: capitalize;">${user.role}</span></p>
          <p><strong>User ID:</strong> ${user._id}</p>
          ${user.createdAt ? `<p><strong>Created:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>` : ''}
          ${user.updatedAt ? `<p><strong>Updated:</strong> ${new Date(user.updatedAt).toLocaleDateString()}</p>` : ''}
          ${user.favoriteBooks ? `<p><strong>Favorite Books:</strong> ${user.favoriteBooks.length}</p>` : ''}
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false,
    });
  };

  if (isLoading || isFetching) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-soil-900">Admin Dashboard</h1>
        <p className="text-sand-700 mt-2">Manage all users and their details</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <ShieldCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{adminCount}</div>
            <p className="text-xs text-muted-foreground">Administrator accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{userCount}</div>
            <p className="text-xs text-muted-foreground">Standard user accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Others</CardTitle>
            <UserX className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{otherCount}</div>
            <p className="text-xs text-muted-foreground">Other role types</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sand-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, or UID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-sand-600" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-300"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-lg border border-sand-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-sand-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-sand-700 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-sand-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-sand-700 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-sand-700 uppercase tracking-wider">
                      UID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-sand-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-sand-200">
                  {filteredUsers
                    .filter((user) => user.uid !== dbUser?.uid)
                    .map((user) => (
                      <tr key={user._id} className="hover:bg-sand-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-leaf-100 flex items-center justify-center">
                              <span className="text-leaf-700 font-semibold">
                                {user.displayName?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-soil-900">
                                {user.displayName || 'Unknown'}
                              </div>
                              {user.createdAt && (
                                <div className="text-xs text-sand-500 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-sand-900 flex items-center gap-2">
                            <Mail className="h-4 w-4 text-sand-400" />
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 'admin'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {user.role === 'admin' ? (
                              <>
                                <Shield className="h-3 w-3 mr-1" />
                                Admin
                              </>
                            ) : (
                              'User'
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-sand-600 font-mono">
                            {user.uid?.substring(0, 20)}...
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewUserDetails(user)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {user.role === 'user' && user.email?.toLowerCase() === 'naharamina68@gmail.com' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateRole(user, 'admin')}
                                className="h-8 text-xs"
                              >
                                <ShieldCheck className="h-3 w-3 mr-1" />
                                Make Admin
                              </Button>
                            )}
                            {user.role === 'admin' && user.email?.toLowerCase() !== 'naharamina68@gmail.com' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateRole(user, 'user')}
                                className="h-8 text-xs"
                              >
                                <UserCheck className="h-3 w-3 mr-1" />
                                Make User
                              </Button>
                            )}
                            {user.role === 'admin' && user.email?.toLowerCase() === 'naharamina68@gmail.com' && (
                              <span className="text-xs text-sand-500 italic px-2">Authorized Admin</span>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {filteredUsers.filter((user) => user.uid !== dbUser?.uid).length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-sand-400 mx-auto mb-4" />
                <p className="text-sand-600">No users found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

