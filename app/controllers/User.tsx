// Temporary utility class to detect account access, can be replaced later
export type Role = "admin" | "user";
export type User = {
    id: number;
    last_name: string;
    first_name: string;
    email: string;
    phone?: string;
    role: Role;

    // Details field
    preferred_name?:string;
    gender?:string;
    date_of_birth?:string;
    address?:string;
    emergency_person?:string;
    emergency_contact?:string;
    pay_rate_id?:string;
    job_title?:string;
};

export type PayRate = {
  id: string;
  job_title: string;
  weekday?: number;
  saturday?: number;
  sunday?: number;
  public_holiday?: number;
  age_group: string;
  level: number;
  specialty?:string;
}

export async function fetchLoggedInAccount(){
  const res = await fetch(`/api/verify`);

  if (!res.ok) {
    throw new Error('Failed to fetch logged in user');
  }
  const data = await res.json();
  return data.user as User;

}

export async function fetchAccount(userId: string) {
  
  const res = await fetch(`/api/users/${userId}`);

  if (!res.ok) {
    throw new Error('Failed to fetch user data');
  }
  const data = await res.json();
  return data[0] as User;
}

export async function fetchAllEmployees() {
  const res = await fetch('/api/users');

  if (!res.ok) {
    throw new Error('Failed to fetch users data');
  }
  const data = await res.json();
  return data as User[];
}

export async function fetchAllUsers() {
  const res = await fetch('/api/users');

  if (!res.ok) {
    throw new Error('Failed to fetch users data');
  }
  const data = await res.json();
  return data;
}


export async function fetchPayRates(pay_rate_id?: string) {

  const res = pay_rate_id ? await fetch('/api/payrates/'+pay_rate_id) : await fetch('/api/payrates');

  if (!res.ok) {
    throw new Error('Failed to fetch pay rates data');
  }
  const data = await res.json();
  return data as PayRate[];
}

export async function updateUser(user: User) {
  try{
    const res = await fetch(`/api/users/${user.id}`,  {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to update shift status:', err);
    return false;
  }
}

export async function updatePassword(user_id: string, password: string) {
  try{
    const res = await fetch(`/api/users/${user_id}/password`,  {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({password}),
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to update user password:', err);
    return false;
  }
}

export async function updatePayRate(user_id: string, job_title: string, age_group: string, level: string, specialty?:string) {
  try{
    const res = await fetch(`/api/users/${user_id}/update_pay_rate`,  {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({job_title, age_group, level, specialty}),
    });

    const { success, pay_rate_id } = await res.json();
    if (success) return pay_rate_id;
    return false;
    
  } catch (err) {
    console.error("Failed to update user's pay rate:", err);
    return false;
  }
}