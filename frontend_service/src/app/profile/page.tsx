'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPut } from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';
import styles from './profile.module.css';

interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  type: string;
}

const ADDRESS_TYPES = ['both', 'shipping', 'billing'];

const emptyAddress: Address = { street: '', city: '', state: '', country: '', type: 'both' };

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<Address>(emptyAddress);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch profile + address once we have the userId
  useEffect(() => {
    if (!user?.userId) return;

    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [profileRes, addressRes] = await Promise.all([
          apiGet(`/users/${user.userId}`),
          apiGet(`/users/${user.userId}/address`),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData.payload);
        }

        if (addressRes.ok) {
          const addressData = await addressRes.json();
          setAddress(addressData.payload);
        }
      } catch (err) {
        console.error('Failed to fetch profile data', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [user?.userId]);

  const openAddressForm = () => {
    setAddressForm(address ?? emptyAddress);
    setSaveSuccess(false);
    setSaveError(null);
    setIsEditingAddress(true);
  };

  const handleAddressChange = (field: keyof Address, value: string) => {
    setAddressForm(prev => ({ ...prev, [field]: value }));
  };

  const saveAddress = async () => {
    if (!user?.userId) return;
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const response = await apiPut(`/users/updateAddress/${user.userId}`, addressForm);
      if (!response.ok) {
        throw new Error('Failed to save address');
      }
      const result = await response.json();
      setAddress(result.payload);
      setSaveSuccess(true);
      setIsEditingAddress(false);
    } catch {
      setSaveError('Could not save address. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const initials = profile
    ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    : '?';

  // Show skeleton while auth state settles or data is loading
  if (authLoading || isLoadingData) {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.pageTitle}>My Profile</div>
        {[1, 2].map(i => (
          <div key={i} className={styles.skeletonCard}>
            <div className={styles.skeletonLine} style={{ width: '40%' }} />
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLine} />
          </div>
        ))}
      </div>
    );
  }

  if (!isAuthenticated || !profile) return null;

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.pageTitle}>My Profile</h1>

      {/* ── Personal Info Card ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Personal Information</h2>
        </div>

        <div className={styles.avatarRow}>
          <div className={styles.avatar}>{initials}</div>
          <div>
            <p className={styles.avatarName}>{profile.first_name} {profile.last_name}</p>
            <p className={styles.avatarEmail}>{profile.email}</p>
          </div>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <label>First Name</label>
            <p>{profile.first_name}</p>
          </div>
          <div className={styles.infoItem}>
            <label>Last Name</label>
            <p>{profile.last_name}</p>
          </div>
          <div className={styles.infoItem}>
            <label>Email</label>
            <p>{profile.email}</p>
          </div>
          <div className={styles.infoItem}>
            <label>Member Since</label>
            <p>{formatDate(profile.created_at)}</p>
          </div>
        </div>
      </div>

      {/* ── Address Card ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Address</h2>
          {!isEditingAddress && (
            <button className={styles.editBtn} onClick={openAddressForm}>
              {address ? 'Edit' : 'Add Address'}
            </button>
          )}
        </div>

        {!isEditingAddress && (
          address ? (
            <p className={styles.addressText}>
              {address.street}<br />
              {address.city}, {address.state}<br />
              {address.country}<br />
              <span style={{ textTransform: 'capitalize', color: '#6b7280', fontSize: '0.8125rem' }}>
                Type: {address.type}
              </span>
            </p>
          ) : (
            <p className={styles.noAddress}>No address saved yet.</p>
          )
        )}

        {saveSuccess && !isEditingAddress && (
          <p className={styles.successMsg}>Address saved successfully.</p>
        )}

        {isEditingAddress && (
          <div className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="street">Street</label>
              <input
                id="street"
                type="text"
                value={addressForm.street}
                onChange={e => handleAddressChange('street', e.target.value)}
                placeholder="123 Main St"
              />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  type="text"
                  value={addressForm.city}
                  onChange={e => handleAddressChange('city', e.target.value)}
                  placeholder="Cairo"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="state">State / Province</label>
                <input
                  id="state"
                  type="text"
                  value={addressForm.state}
                  onChange={e => handleAddressChange('state', e.target.value)}
                  placeholder="Cairo Governorate"
                />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="country">Country</label>
                <input
                  id="country"
                  type="text"
                  value={addressForm.country}
                  onChange={e => handleAddressChange('country', e.target.value)}
                  placeholder="Egypt"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="type">Address Type</label>
                <select
                  id="type"
                  value={addressForm.type}
                  onChange={e => handleAddressChange('type', e.target.value)}
                >
                  {ADDRESS_TYPES.map(t => (
                    <option key={t} value={t} style={{ textTransform: 'capitalize' }}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {saveError && <p className={styles.errorMsg}>{saveError}</p>}

            <div className={styles.formActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => { setIsEditingAddress(false); setSaveError(null); }}
              >
                Cancel
              </button>
              <button className={styles.saveBtn} onClick={saveAddress} disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save Address'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
