import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllUsers, updateUserRole, updateUserMembership, getUserStatistics, getPaymentAnalytics, getAllCoupons, saveCoupon, deleteCoupon, toggleCouponStatus, deleteUser, savePricingChanges as savePricingToFirestore, updateCoupon } from '../services/adminDashboard';
import { MEMBERSHIP_PLANS } from '../services/adminDashboard';
import AdminLayout from '../layouts/AdminLayout';

// Components
import SuperAdminOverviewTab from '../components/SuperAdminOverviewTab';
import SuperAdminUsersTab from '../components/SuperAdminUsersTab';
import SuperAdminPaymentsTab from '../components/SuperAdminPaymentsTab';
import SuperAdminCouponsTab from '../components/SuperAdminCouponsTab';
import SuperAdminPricingTab from '../components/SuperAdminPricingTab';
import SuperAdminRolesTab from '../components/SuperAdminRolesTab';
import SettingsTab from '../components/SettingsTab';
import { Settings } from 'lucide-react';

const SuperAdminDashboard = () => {
  const { currentUser: user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Tab handling from URL
  const getTabFromPath = () => {
    const path = location.pathname;
    const parts = path.split('/');
    // Check if this is a /boss or /super route
    // parts[0] is empty, parts[1] is 'boss' or 'super', parts[2] is the tab
    if (parts[1] === 'boss' || parts[1] === 'super') {
      return parts[2] || 'overview';
    }
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath());

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location]);

  // States
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [superadmins, setSuperadmins] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [statistics, setStatistics] = useState({});
  const [paymentAnalytics, setPaymentAnalytics] = useState({ payments: [], analytics: {} });
  const [editingPrices, setEditingPrices] = useState(false);
  const [tempPrices, setTempPrices] = useState({});
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    monthlyDiscount: '',
    yearlyDiscount: '',
    type: 'percentage',
    description: '',
    active: true
  });

  const fetchAllData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [usersData, statsData, paymentData, couponData] = await Promise.all([
        getAllUsers(user.uid),
        getUserStatistics(user.uid),
        getPaymentAnalytics(user.uid),
        getAllCoupons(user.uid)
      ]);

      setAllUsers(usersData);
      setStatistics(statsData);
      setPaymentAnalytics(paymentData);
      setCoupons(couponData);

      const superAdminUsers = usersData.filter(user => user.role === 'superadmin');
      const adminUsers = usersData.filter(user => user.role === 'admin');

      setUsers(superAdminUsers);
      setAdmins(adminUsers);
      setSuperadmins(superAdminUsers);

      // Initialize temp prices with current membership plans
      setTempPrices(MEMBERSHIP_PLANS);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
        fetchAllData();
    }
  }, [fetchAllData, user?.uid]);

  // Optimized search with debouncing
  const handleSearchInput = (email) => {
    setSearchEmail(email);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (!email.trim()) {
      setSearchResults([]);
      return;
    }

    const newTimeout = setTimeout(() => {
      performSearch(email);
    }, 500);

    setSearchTimeout(newTimeout);
  };

  const performSearch = (email) => {
    if (!email.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = allUsers.filter(user =>
        user.email && user.email.toLowerCase().includes(email.toLowerCase())
      );

      setSearchResults(results);

      if (results.length === 0) {
        toast.error('No user found with this email');
      }
    } catch (error) {
      console.error('Error searching user:', error);
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const searchUserByEmail = () => {
    performSearch(searchEmail);
  };

  // Change user role
  const changeUserRole = async (userId, newRole, currentRole) => {
    try {
      if (newRole === currentRole) {
        toast.error('User already has this role');
        return;
      }

      await updateUserRole(userId, newRole, user.uid);
      toast.success(`User role updated to ${newRole}`);
      await fetchAllData();

      if (searchResults.length > 0) {
        setSearchResults(prev => prev.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        ));
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  // Change user plan
  const changeUserPlan = async (userId, newPlan) => {
    try {
      await updateUserMembership(userId, newPlan, 'monthly', null, user.uid);
      toast.success(`User plan updated to ${newPlan}`);
      await fetchAllData();

      if (searchResults.length > 0) {
        setSearchResults(prev => prev.map(user =>
          user.id === userId ? {
            ...user,
            membership: { ...user.membership, plan: newPlan }
          } : user
        ));
      }
    } catch (error) {
      console.error('Error updating user plan:', error);
      toast.error('Failed to update user plan');
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteUser(userId, user.uid);
      toast.success('User deleted successfully');
      await fetchAllData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  // Save pricing changes
  const savePricingChanges = async () => {
    try {
      const processedPrices = { ...tempPrices };
      
      // Calculate discount percentage based on manual yearly price entry
      Object.keys(processedPrices).forEach(planId => {
        const plan = processedPrices[planId];
        if (plan.monthly && plan.yearly) {
          const theoreticalYearly = plan.monthly * 12;
          const discount = theoreticalYearly > 0 ? ((theoreticalYearly - plan.yearly) / theoreticalYearly) * 100 : 0;
          processedPrices[planId] = { 
            ...plan, 
            yearlyDiscountPercentage: parseFloat(discount.toFixed(1))
          };
        }
      });

      await savePricingToFirestore(processedPrices, user.uid);
      
      // Update local state
      Object.keys(processedPrices).forEach(planId => {
        if (MEMBERSHIP_PLANS[planId]) {
          MEMBERSHIP_PLANS[planId] = { ...MEMBERSHIP_PLANS[planId], ...processedPrices[planId] };
        }
      });
      
      toast.success('Pricing updated successfully');
      setEditingPrices(false);
    } catch (error) {
      console.error('Error saving pricing:', error);
      toast.error('Failed to save pricing');
    }
  };

  // Add new coupon
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
          active: true
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

  // Toggle coupon status
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

  // Update coupon
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

  // Delete coupon
  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) {
      return;
    }

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

  const getPageTitle = (tab) => {
    switch (tab) {
      case 'overview': return 'Super Admin Overview';
      case 'users': return 'User Management';
      case 'analytics': return 'System Analytics';
      case 'payments': return 'Transactions & Revenue';
      case 'coupons': return 'Coupon Management';
      case 'membership': return 'Membership Plans';
      case 'roles': return 'Role Assignments';
      case 'settings': return 'System Settings';
      default: return 'Dashboard';
    }
  };

  // Animation variants
  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <AdminLayout isSuperAdmin={true} title={getPageTitle(activeTab)}>
      {activeTab === 'overview' && (
        <SuperAdminOverviewTab
          tabVariants={tabVariants}
          statistics={{
            ...statistics,
            monthlyRevenue: paymentAnalytics?.analytics?.totalRevenue || 0
          }}
          allUsers={allUsers}
          admins={admins}
          superadmins={superadmins}
        />
      )}

      {activeTab === 'users' && (
        <SuperAdminUsersTab
          tabVariants={tabVariants}
          searchEmail={searchEmail}
          handleSearchInput={handleSearchInput}
          searchUserByEmail={searchUserByEmail}
          isSearching={isSearching}
          searchResults={searchResults}
          changeUserRole={changeUserRole}
          changeUserPlan={changeUserPlan}
          deleteUser={handleDeleteUser}
          admins={admins}
          superadmins={superadmins}
          loading={loading}
        />
      )}

      {activeTab === 'payments' && (
        <SuperAdminPaymentsTab
          tabVariants={tabVariants}
          paymentAnalytics={paymentAnalytics}
          onSyncSuccess={fetchAllData}
        />
      )}

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

      {activeTab === 'membership' && (
        <SuperAdminPricingTab
          tabVariants={tabVariants}
          editingPrices={editingPrices}
          setEditingPrices={setEditingPrices}
          tempPrices={tempPrices}
          setTempPrices={setTempPrices}
          savePricingChanges={savePricingChanges}
        />
      )}

      {activeTab === 'roles' && (
        <SuperAdminRolesTab
          tabVariants={tabVariants}
          allUsers={allUsers}
          admins={admins}
          superadmins={superadmins}
          onPlanChange={changeUserPlan}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsTab
          coupons={coupons}
          addCoupon={addCoupon}
          handleToggleCouponStatus={handleToggleCouponStatus}
          handleDeleteCoupon={handleDeleteCoupon}
          newCoupon={newCoupon}
          setNewCoupon={setNewCoupon}
        />
      )}
    </AdminLayout>
  );
};

export default SuperAdminDashboard;