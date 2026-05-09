import { apiRequest } from './api';

export interface WasteTypeOption {
  id: string;
  value: string;
  label: string;
  unit: string;
  pointsPerKg: number;
}

export interface TransactionItem {
  id: string;
  rawId: number;
  userId: string;
  customerId: string;
  customerName: string;
  date: string;
  weight: number;
  totalPoints: number;
  points: number;
  pointsPerKg: number;
  status: 'pending' | 'verified' | 'rejected';
  method: 'Drop-off' | 'Pickup';
  notes?: string;
  wasteType: string;
  wasteTypes: string[];
}

export interface PickupItem {
  id: string;
  rawId: number;
  userId: string;
  customer: string;
  phone: string | null;
  address: string | null;
  scheduleId: string | null;
  area: string | null;
  day: string | null;
  time: string | null;
  wasteType: string;
  estimatedWeight: number;
  date: string;
  status: 'pending' | 'approved' | 'scheduled' | 'rejected' | 'done';
  notes: string;
  requestedAt: string;
  scheduledAt: string | null;
}

export interface UserPointsResponse {
  userId: string;
  name?: string;
  totalPoints: number;
  earnedPoints?: number;
  reservedPoints?: number;
}

export interface RewardItem {
  id: number;
  name: string;
  description: string;
  pointsRequired: number;
  stock: number;
  category: string;
  isActive?: boolean;
}

export interface RedemptionItem {
  id: number;
  rewardId: number;
  rewardName: string;
  userId: string;
  userName: string;
  userEmail?: string;
  quantity: number;
  pointsUsed: number;
  address: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestDate: string;
  processedDate?: string | null;
  processedBy?: string | null;
  processedByName?: string | null;
}

export interface SummaryResponse {
  total_transaksi: number;
  total_verified: number;
  total_pending: number;
  total_rejected: number;
  total_berat: number;
  total_poin: number;
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'nasabah';
  phone?: string | null;
  address?: string | null;
  roomNumber?: string | null;
  points?: number;
}

export interface AdminWasteTypeItem {
  id: number;
  nama: string;
  satuan: string;
  poinPerSatuan: number;
  isAktif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleItem {
  id_jadwal: number;
  wilayah: string;
  hari: string;
  jam: string;
  keterangan: string | null;
  is_aktif: number;
  created_at: string;
  updated_at: string;
}

export async function fetchWasteTypes() {
  return apiRequest<WasteTypeOption[]>('/waste-types');
}

export async function createSellTransaction(params: {
  token: string;
  userId: string;
  wasteTypeId: string;
  weight: number;
  notes?: string;
}) {
  const transaction = await apiRequest<{ transactionId: number; id_transaksi: number; message: string }>(
    '/transaksi',
    {
      method: 'POST',
      token: params.token,
      body: {
        userId: params.userId,
        method: 'Drop-off',
        notes: params.notes,
      },
    }
  );

  const detail = await apiRequest<{
    message: string;
    points: number;
    pointsPerKg: number;
    wasteType: string;
  }>('/detail', {
    method: 'POST',
    token: params.token,
    body: {
      transactionId: transaction.transactionId,
      wasteTypeId: params.wasteTypeId,
      weight: params.weight,
    },
  });

  return {
    transactionId: transaction.transactionId,
    ...detail,
  };
}

export async function fetchTransactions(userId?: string) {
  const query = userId ? `/transaksi?userId=${encodeURIComponent(userId)}` : '/transaksi';
  return apiRequest<TransactionItem[]>(query);
}

export async function fetchUserPoints(userId: string, token?: string | null) {
  return apiRequest<UserPointsResponse>(`/users/${encodeURIComponent(userId)}/points`, {
    token,
  });
}

export async function fetchRewards() {
  return apiRequest<RewardItem[]>('/rewards');
}

export async function fetchAdminRewards(token: string) {
  return apiRequest<RewardItem[]>('/admin/rewards', { token });
}

export async function createReward(
  token: string,
  payload: Omit<RewardItem, 'id' | 'isActive'>
) {
  return apiRequest<{ message: string; id: number }>('/admin/rewards', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function updateReward(
  token: string,
  id: number,
  payload: Omit<RewardItem, 'id' | 'isActive'>
) {
  return apiRequest<{ message: string }>(`/admin/rewards/${id}`, {
    method: 'PUT',
    token,
    body: payload,
  });
}

export async function deleteReward(token: string, id: number) {
  return apiRequest<{ message: string }>(`/admin/rewards/${id}`, {
    method: 'DELETE',
    token,
  });
}

export async function createRewardRedemption(
  token: string,
  rewardId: number,
  payload: { quantity: number; address: string; notes?: string }
) {
  return apiRequest<{ message: string; id: number }>(`/rewards/${rewardId}/redeem`, {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function fetchMyRedemptions(token: string) {
  return apiRequest<RedemptionItem[]>('/redemptions/me', { token });
}

export async function fetchAdminRedemptions(token: string) {
  return apiRequest<RedemptionItem[]>('/admin/redemptions', { token });
}

export async function updateRedemptionStatus(
  token: string,
  redemptionId: number,
  status: RedemptionItem['status']
) {
  return apiRequest<{ message: string }>(`/admin/redemptions/${redemptionId}/status`, {
    method: 'PATCH',
    token,
    body: { status },
  });
}

export async function createPickupRequest(params: {
  token: string;
  userId: string;
  scheduleId?: string;
  wasteType: string;
  estimatedWeight: number;
  pickupDate: string;
  timeSlot: string;
  address: string;
  notes: string;
}) {
  return apiRequest<{ message: string; id_pickup: number }>('/pickup', {
    method: 'POST',
    token: params.token,
    body: {
      userId: params.userId,
      scheduleId: params.scheduleId,
      wasteType: params.wasteType,
      estimatedWeight: params.estimatedWeight,
      pickupDate: params.pickupDate,
      timeSlot: params.timeSlot,
      address: params.address,
      notes: params.notes,
    },
  });
}

export async function fetchPickups(token: string, userId?: string) {
  const query = userId ? `/pickup?userId=${encodeURIComponent(userId)}` : '/pickup';
  return apiRequest<PickupItem[]>(query, { token });
}

export async function updatePickupStatus(
  token: string,
  pickupId: number,
  status: PickupItem['status']
) {
  return apiRequest<{ message: string }>(`/pickup/${pickupId}/status`, {
    method: 'PATCH',
    token,
    body: { status },
  });
}

export async function fetchAdminSummary(token: string) {
  return apiRequest<SummaryResponse>('/laporan/summary', { token });
}

export async function fetchUsers(token: string) {
  return apiRequest<UserListItem[]>('/users', { token });
}

export async function verifyTransaction(
  token: string,
  transactionId: number,
  status: 'verified' | 'rejected'
) {
  return apiRequest<{ message: string }>(`/transaksi/${transactionId}/verify`, {
    method: 'PATCH',
    token,
    body: { status },
  });
}

export async function fetchAdminWasteTypes(token: string) {
  return apiRequest<AdminWasteTypeItem[]>('/jenis-sampah', { token });
}

export async function createAdminWasteType(
  token: string,
  payload: { nama: string; satuan: string; poinPerSatuan: number }
) {
  return apiRequest<{ message: string; id: number }>('/jenis-sampah', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function updateAdminWasteType(
  token: string,
  id: number,
  payload: Partial<{ nama: string; satuan: string; poinPerSatuan: number; isAktif: boolean }>
) {
  return apiRequest<{ message: string }>(`/jenis-sampah/${id}`, {
    method: 'PUT',
    token,
    body: payload,
  });
}

export async function deleteAdminWasteType(token: string, id: number) {
  return apiRequest<{ message: string }>(`/jenis-sampah/${id}`, {
    method: 'DELETE',
    token,
  });
}

export async function fetchSchedules() {
  return apiRequest<ScheduleItem[]>('/jadwal');
}

export async function createSchedule(
  token: string,
  payload: { wilayah: string; hari: string; jam: string; keterangan?: string }
) {
  return apiRequest<{ message: string; id_jadwal: number }>('/jadwal', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function updateSchedule(
  token: string,
  id: number,
  payload: Partial<{ wilayah: string; hari: string; jam: string; keterangan: string; is_aktif: number }>
) {
  return apiRequest<{ message: string }>(`/jadwal/${id}`, {
    method: 'PUT',
    token,
    body: payload,
  });
}

export async function deleteSchedule(token: string, id: number) {
  return apiRequest<{ message: string }>(`/jadwal/${id}`, {
    method: 'DELETE',
    token,
  });
}
