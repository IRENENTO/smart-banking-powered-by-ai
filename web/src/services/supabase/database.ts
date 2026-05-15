import { supabase } from '../../lib/supabase';

type QueryFilter = Record<string, any>;

const buildQuery = (table: string, filters?: QueryFilter) => {
  let query = supabase.from(table).select('*');

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
  }

  return query;
};

export const supabaseDb = {
  // Generic CRUD
  getAll: async <T = any>(table: string, filters?: QueryFilter): Promise<T[]> => {
    const { data, error } = await buildQuery(table, filters);
    if (error) throw error;
    return (data || []) as T[];
  },

  getById: async <T = any>(table: string, id: number | string): Promise<T | null> => {
    const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
    if (error) throw error;
    return data as T;
  },

  create: async <T = any>(table: string, record: Record<string, any>): Promise<T> => {
    const { data, error } = await supabase.from(table).insert(record).select().single();
    if (error) throw error;
    return data as T;
  },

  update: async <T = any>(table: string, id: number | string, record: Record<string, any>): Promise<T> => {
    const { data, error } = await supabase.from(table).update(record).eq('id', id).select().single();
    if (error) throw error;
    return data as T;
  },

  remove: async (table: string, id: number | string): Promise<void> => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  },

  // Specific queries
  getUserByAccountNumber: async (accountNumber: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('account_number', accountNumber)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  getUserByPhone: async (phone: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  getTransactions: async (userId: number, limit = 50, offset = 0) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return data || [];
  },

  getLoans: async (userId: number) => {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  getSchedules: async (userId: number) => {
    const { data, error } = await supabase
      .from('payment_schedules')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  getSavingsGoals: async (userId: number) => {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  getInsights: async (userId: number) => {
    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  getNotifications: async (userId: number) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  updateBalance: async (userId: number, newBalance: number) => {
    const { error } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', userId);
    if (error) throw error;
  },
};
