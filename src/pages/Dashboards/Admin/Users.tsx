import UseAxiosSecure from '@/axios/UseAxiosSecure';
import { useAuth } from '@/firebase/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { Loader } from 'lucide-react';
import Swal from 'sweetalert2';

const Users = () => {
  const { dbUser } = useAuth();
  const axiossecure = UseAxiosSecure();

  const {
    data: users = [],
    isPending,
    isFetching,
    refetch: GetUsers,
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await axiossecure.get('/api/users');
      return res.data;
    },
  });

  const HandleMakeUser = async (user: any) => {
    const ADMIN_EMAIL = 'naharamina68@gmail.com';
    
    // Prevent removing admin from authorized email
    if (user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: 'Cannot remove admin role from authorized admin account',
      });
      return;
    }

    try {
      const payload = { role: 'user' };
      const response = await axiossecure.put(
        `/api/users/${user?.uid}`,
        payload
      );
      console.log(response);
      await GetUsers();

      await Swal.fire({
        title: 'Success!',
        text: 'The user role has been changed to User.',
        icon: 'success',
      });
    } catch (error: any) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error?.response?.data?.message || `Something went wrong!.. ${error}`,
      });
    }
  };

  const HandleMakeAdmin = async (user: any) => {
    const ADMIN_EMAIL = 'naharamina68@gmail.com';
    
    // Prevent making others admin
    if (user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: 'Only naharamina68@gmail.com can be assigned admin role',
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Make Admin!',
      });

      if (result.isConfirmed) {
        const payload = { role: 'admin' };
        const response = await axiossecure.put(
          `/api/users/${user?.uid}`,
          payload
        );
        console.log(response);
        await GetUsers();
        await Swal.fire({
          title: 'Success!',
          text: 'The User has been made Admin.',
          icon: 'success',
        });
      }
    } catch (error: any) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error?.response?.data?.message || `Something went wrong!.. ${error}`,
      });
    }
  };

  if (isPending) {
    return (
      <div className="flex justify-center items-center font-bold gap-2 min-h-screen">
        <span className="text-3xl font-medium">Loading Users</span>
        <Loader className="mt-2 animate-spin" />
      </div>
    );
  }

  if (isFetching) {
    return (
      <div className="flex justify-center items-center font-bold gap-2 min-h-screen">
        <span className="text-3xl font-medium">Refreshing</span>
        <Loader className="mt-2 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3 text-center">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-center">
              Email
            </th>
            <th scope="col" className="px-6 py-3 text-center">
              Role
            </th>
            <th scope="col" className="px-6 py-3 text-center">
              UID
            </th>
            <th scope="col" className="px-6 py-3 text-center">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {users
            .filter((user: any) => user?.uid !== dbUser?.uid)
            .map((user: any, index: number) => (
              <tr
                key={index}
                className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200"
              >
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center"
                >
                  {user?.displayName}
                </th>
                <td className="px-6 py-4 text-center">{user?.email}</td>
                <td className="px-6 py-4 text-center">{user?.role}</td>
                <td className="px-6 py-4 text-center">{user?.uid}</td>
                <td className="px-6 py-4 text-center">
                  {user?.role === 'user' && user?.email?.toLowerCase() === 'naharamina68@gmail.com' && (
                    <button
                      onClick={() => HandleMakeAdmin(user)}
                      className="p-2 bg-blue-400 text-sm lg:text-base hover:bg-blue-600 transition-all duration-300 text-black rounded-lg"
                    >
                      Make Admin
                    </button>
                  )}
                  {user?.role === 'admin' && user?.email?.toLowerCase() !== 'naharamina68@gmail.com' && (
                    <button
                      onClick={() => HandleMakeUser(user)}
                      className="p-2 bg-green-600 text-sm lg:text-base hover:bg-green-800 transition-all duration-300 text-black rounded-lg"
                    >
                      Make User
                    </button>
                  )}
                  {user?.role === 'admin' && user?.email?.toLowerCase() === 'naharamina68@gmail.com' && (
                    <span className="text-xs text-gray-500 italic">Authorized Admin</span>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
