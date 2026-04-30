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
}) {
  const transaction = await apiRequest<{ transactionId: number; id_transaksi: number; message: string }>(
    '/transaksi',
    {
      method: 'POST',
      token: params.token,
      body: {
        userId: params.userId,
        method: 'Drop-off',
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

export async function fetchUserPoints(userId: string) {
  return apiRequest<UserPointsResponse>(`/users/${encodeURIComponent(userId)}/points`);
}

export async function createPickupRequest(params: {
  token: string;
  userId: string;
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
