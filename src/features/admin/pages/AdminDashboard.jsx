import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import {
  Users,
  TrendingUp,
  CreditCard,
  Settings,
  Package,
} from 'lucide-react'; // Removing these in actual edit as they are unused
import {
  getAllUsers,
  updateUserRole,
  updateUserMembership,
  getUserStatistics,
  MEMBERSHIP_PLANS,
  getPaymentAnalytics,
  testPaymentsCollection,
  savePricingChanges,
  getCurrentPricing,
  deleteUser
} from '../services/adminDashboard';
import {
  getAllCoupons,
  saveCoupon,
  deleteCoupon,
  toggleCouponStatus,
  updateCoupon
} from '../../../utils/couponManagement';
import { checkIsSuperAdmin, getUserRoleLevel, ROLE_HIERARCHY, canModifyUserRole } from '../services/roleManagement';
import { getUserRole } from '../../users/services/userService';
import OverviewTab from '../components/OverviewTab';
import UsersTab from '../components/UsersTab';
import SuperAdminCouponsTab from '../components/SuperAdminCouponsTab';
import SuperAdminPaymentsTab from '../components/SuperAdminPaymentsTab';
import AnalyticsTab from '../components/AnalyticsTab';
import toast, { Toaster } from 'react-hot-toast';
import AdminLayout from '../layouts/AdminLayout';

const AdminDashboard = () => {
  const { currentUser: user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State for user role information
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userRoleLevel, setUserRoleLevel] = useState(1);
  const [accessLevel, setAccessLevel] = useState('admin');

  // Check if this is a super admin accessing via /super routes
  // Ideally this component should be used for standard /admin routes too

  // Extract tab from URL path
  const getTabFromPath = () => {
    const path = location.pathname;
    const parts = path.split('/');
    // Check if this is a /super route (e.g. /super/users)
    if (parts[1] === 'super') {
      return parts[2] || 'overview';
    }
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath());
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [superadmins, setSuperadmins] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [paymentAnalytics, setPaymentAnalytics] = useState({ payments: [], analytics: {} });
  const [loading, setLoading] = useState(true);
  const [editingPrices, setEditingPrices] = useState(false);
  const [tempPrices, setTempPrices] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const searchTimeoutRef = useRef(null);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    monthlyDiscount: '',
    yearlyDiscount: '',
    type: 'percentage',
    description: '',
    active: true,
    duration: 'monthly'
  });

  // Fetch coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const couponData = await getAllCoupons(user.uid);
        setCoupons(couponData);
      } catch (error) {
        console.error('Error fetching coupons:', error);
        toast.error('Failed to load coupons');
      }
    };
    fetchCoupons();
  }, []);

  // Add Coupon
  const addCoupon = async () => {
    if (!newCoupon.code || (!newCoupon.monthlyDiscount && !newCoupon.yearlyDiscount) || !newCoupon.description) {
      toast.error('Please fill all required coupon fields');
      return;
    }

    try {
      const couponData = {
        code: newCoupon.code.toUpperCase(),
        monthlyDiscount: newCoupon.monthlyDiscount ? parseFloat(newCoupon.monthlyDiscount) : 0,
        yearlyDiscount: newCoupon.yearlyDiscount ? parseFloat(newCoupon.yearlyDiscount) : 0,
        type: newCoupon.type,
        description: newCoupon.description,
        active: newCoupon.active,
        duration: newCoupon.duration,
        createdAt: new Date()
      };

      const result = await saveCoupon(couponData, user.uid);
      if (result.success) {
        const updatedCoupons = await getAllCoupons(user.uid);
        setCoupons(updatedCoupons);
        setNewCoupon({
          code: '',
          monthlyDiscount: '',
          yearlyDiscount: '',
          type: 'percentage',
          description: '',
          active: true,
          duration: 'monthly'
        });
        toast.success('Coupon added successfully');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error adding coupon:', error);
      toast.error('Failed to add coupon');
    }
  };

  const handleToggleCouponStatus = async (id, currentStatus) => {
    try {
      const result = await toggleCouponStatus(id, !currentStatus, user.uid);
      if (result.success) {
        const updatedCoupons = await getAllCoupons(user.uid);
        setCoupons(updatedCoupons);
        toast.success('Coupon status updated');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error updating coupon status:', error);
      toast.error('Failed to update coupon status');
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      const result = await deleteCoupon(id, user.uid);
      if (result.success) {
        const updatedCoupons = await getAllCoupons(user.uid);
        setCoupons(updatedCoupons);
        toast.success('Coupon deleted');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Failed to delete coupon');
    }
  };

  const handleUpdateCoupon = async (id, updateData) => {
    try {
      // Validate required fields
      if (!updateData.code || (!updateData.monthlyDiscount && !updateData.yearlyDiscount)) {
        toast.error('Code and at least one discount type are required');
        return;
      }
      
      const result = await updateCoupon(id, updateData, user.uid);
      if (result.success) {
        const updatedCoupons = await getAllCoupons(user.uid);
        setCoupons(updatedCoupons);
        toast.success('Coupon updated successfully');
        return true;
      } else {
        toast.error(result.message);
        return false;
      }
    } catch (error) {
      console.error('Error updating coupon:', error);
      toast.error('Failed to update coupon');
      return false;
    }
  };

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location]);

  useEffect(() => {
    const checkUserRole = async () => {
      if (user?.uid) {
        const userRole = await getUserRole(user.uid);
        const isSA = checkIsSuperAdmin(userRole);
        const roleLevel = getUserRoleLevel(userRole);

        setIsSuperAdmin(isSA);
        setUserRoleLevel(roleLevel);

        if (isSA) {
          setAccessLevel('superadmin');
        } else if (roleLevel === ROLE_HIERARCHY.admin) {
          setAccessLevel('admin');
        }
      }
    };
    if (user?.uid) {
        checkUserRole();
    }
  }, [user?.uid]);


  useEffect(() => {
    const fetchCurrentPricing = async () => {
      try {
        const currentPricing = await getCurrentPricing();
        const enhancedPricing = {
          free: {
            monthly: currentPricing.free?.monthly || 0,
            yearly: currentPricing.free?.yearly || 0,
            yearlyDiscountPercentage: currentPricing.free?.yearlyDiscountPercentage || 0
          },
          starter: {
            monthly: currentPricing.starter?.monthly || 199,
            yearly: currentPricing.starter?.yearly || 1999,
            yearlyDiscountPercentage: currentPricing.starter?.yearlyDiscountPercentage || 16.7
          },
          plus: {
            monthly: currentPricing.plus?.monthly || 999,
            yearly: currentPricing.plus?.yearly || 9999,
            yearlyDiscountPercentage: currentPricing.plus?.yearlyDiscountPercentage || 16.7
          },
          business: {
            monthly: currentPricing.business?.monthly || 2499,
            yearly: currentPricing.business?.yearly || 24999,
            yearlyDiscountPercentage: currentPricing.business?.yearlyDiscountPercentage || 16.7
          }
        };
        setTempPrices(enhancedPricing);
        Object.keys(enhancedPricing).forEach(planId => {
          if (MEMBERSHIP_PLANS[planId]) {
            MEMBERSHIP_PLANS[planId] = {
              ...MEMBERSHIP_PLANS[planId],
              ...enhancedPricing[planId]
            };
          }
        });
      } catch (error) {
        console.error('Error fetching current pricing:', error);
        setTempPrices(MEMBERSHIP_PLANS);
      }
    };
    fetchCurrentPricing();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const [usersData, statsData, paymentData] = await Promise.all([
          getAllUsers(user.uid),
          getUserStatistics(user.uid),
          getPaymentAnalytics(user.uid)
        ]);
        // Filter out super admins from the list for standard admins
        const filteredUsersData = usersData.filter(u => u.role !== 'superadmin' && u.role !== 'super_admin');
        setUsers(filteredUsersData);
        setFilteredUsers(filteredUsersData);
        setStatistics(statsData);
        setPaymentAnalytics(paymentData);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      if (term.trim() === '') {
        setFilteredUsers(users);
      } else {
        const lowerTerm = term.toLowerCase();
        const filtered = users.filter(u =>
          (u.email && u.email.toLowerCase().includes(lowerTerm)) ||
          (u.displayName && u.displayName.toLowerCase().includes(lowerTerm)) ||
          (u.uniqueUserId && u.uniqueUserId.toLowerCase().includes(lowerTerm))
        );
        setFilteredUsers(filtered);
      }
    }, 300);
  }, [users]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.uniqueUserId && user.uniqueUserId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  const handleMembershipChange = async (userId, newPlan) => {
    try {
      await updateUserMembership(userId, newPlan, 'monthly', null, user.uid);
      setUsers(prev => prev.map(u =>
        u.id === userId
          ? { ...u, membership: { ...u.membership, plan: newPlan } }
          : u
      ));
      toast.success(`Membership updated to ${newPlan}`);
    } catch (error) {
      console.error('Error updating membership:', error);
      toast.error('Failed to update membership');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) {
        toast.error('User not found');
        return;
      }

      if (!canModifyUserRole(accessLevel, user.role, newRole)) {
        toast.error('Insufficient permissions to modify user role');
        return;
      }

      await updateUserRole(userId, newRole, user.uid);
      setUsers(prev => prev.map(u =>
        u.id === userId
          ? { ...u, role: newRole }
          : u
      ));
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleSavePrices = async () => {
    try {
      const processedPrices = { ...tempPrices };
      // In AdminDashboard/PricingTab, users edit Monthly and Yearly Discount. 
      // Yearly price is displayed but potentially editable (but overwritten by logic).
      // We should enforce consistency: derived Yearly Price from Discount.
      Object.keys(processedPrices).forEach(planId => {
        const plan = processedPrices[planId];
        if (plan.monthly !== undefined) {
          const discountPercentage = plan.yearlyDiscountPercentage || 0;
          const yearlyPrice = Math.round(plan.monthly * 12 * (1 - discountPercentage / 100));
          processedPrices[planId] = { ...plan, yearly: yearlyPrice, yearlyDiscountPercentage: discountPercentage };
        }
      });

      await savePricingChanges(processedPrices, user.uid);
      toast.success('Pricing updated successfully!');

      setEditingPrices(false);
    } catch (error) {
      console.error('Error saving price changes:', error);
      toast.error('Failed to save pricing changes');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getRoleOptions = (userRole) => {
    const options = [
      { value: 'user', label: 'User' },
      { value: 'premium', label: 'Premium User' }
    ];

    if (accessLevel === 'superadmin') {
      options.push(
        { value: 'admin', label: 'Admin' },
        { value: 'superadmin', label: 'Super Admin' }
      );
    }
    return options;
  };

  const planOptions = [
    { value: 'free', label: 'Free' },
    { value: 'starter', label: 'Starter' },
    { value: 'plus', label: 'Plus' },
    { value: 'pro', label: 'Pro' },
    { value: 'business', label: 'Business' }
  ];

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const handleDeleteUser = async (userId, userEmail) => {
    try {
      setUserToDelete({ id: userId, email: userEmail });
      setShowDeleteModal(true);
    } catch (error) {
      toast.error('Failed to prepare user deletion');
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.id, user.uid);
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete.id));
      setFilteredUsers(prevFiltered => prevFiltered.filter(user => user.id !== userToDelete.id));

      toast.success(`User ${userToDelete.email} deleted successfully`);
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const getPageTitle = (tab) => {
    switch (tab) {
      case 'overview': return 'Dashboard Overview';
      case 'users': return 'User Management';
      case 'coupons': return 'Coupon Management';
      case 'analytics': return 'Analytics';
      default: return 'Dashboard';
    }
  };



  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <AdminLayout isSuperAdmin={false} title={getPageTitle(activeTab)}>
      <Toaster />

      {/* Delete User Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md border border-zinc-800 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4 text-white">Confirm User Deletion</h3>
            <p className="text-zinc-300 mb-2">
              Are you sure you want to delete user <span className="font-semibold text-white">{userToDelete?.email}</span>?
            </p>
            <p className="text-sm text-zinc-400 mb-6">
              This action cannot be undone. All user data will be permanently removed.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <OverviewTab 
            statistics={{
                ...statistics,
                monthlyRevenue: paymentAnalytics?.analytics?.monthlyRevenue?.[`${new Date().getFullYear()}-${new Date().getMonth() + 1}`] || 0
            }} 
            formatCurrency={(value) => `₹${value}`} 
        />
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <UsersTab
          searchTerm={searchTerm}
          handleSearch={handleSearch}
          loading={loading}
          currentUsers={currentUsers}
          handleRoleChange={handleRoleChange}
          accessLevel={accessLevel}
          getRoleOptions={getRoleOptions}
          handleMembershipChange={handleMembershipChange}
          planOptions={[{ label: 'Free', value: 'free' }, { label: 'Plus', value: 'plus' }, { label: 'Pro', value: 'pro' }, { label: 'Business', value: 'business' }, { label: 'Starter', value: 'starter' }]}
          handleDeleteUser={handleDeleteUser}
          totalPages={totalPages}
          currentPage={currentPage}
          paginate={setCurrentPage}
          indexOfFirstUser={(currentPage - 1) * usersPerPage}
          indexOfLastUser={Math.min(currentPage * usersPerPage, filteredUsers.length)}
          filteredUsersLength={filteredUsers.length}
        />
      )}

      {/* Coupons Tab */}
      {activeTab === 'coupons' && (
        <SuperAdminCouponsTab
          tabVariants={tabVariants}
          coupons={coupons}
          newCoupon={newCoupon}
          setNewCoupon={setNewCoupon}
          addCoupon={addCoupon}
          handleToggleCouponStatus={handleToggleCouponStatus}
          handleDeleteCoupon={handleDeleteCoupon}
          handleUpdateCoupon={handleUpdateCoupon}
        />
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <AnalyticsTab
          tabVariants={tabVariants}
          statistics={statistics}
          users={users}
        />
      )}

      {/* Payments Reconciliation Tab */}
      {activeTab === 'payments' && (
        <SuperAdminPaymentsTab
          tabVariants={tabVariants}
          paymentAnalytics={paymentAnalytics}
          onSyncSuccess={() => {
             // Re-fetch data on sync success
             const fetchData = async () => {
                const pData = await getPaymentAnalytics(user.uid);
                setPaymentAnalytics(pData);
             };
             fetchData();
          }}
        />
      )}

    </AdminLayout>
  );
};

export default AdminDashboard;