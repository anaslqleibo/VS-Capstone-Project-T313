import dayjs from "dayjs";
import { getAuthorizationHeader } from "../lib/auth";
import { fetchApi } from "../lib/api";

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

    // Will always be empty, except when it is updated to a new value
    password?:string
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
  const res = await fetchApi(`/verify`);

  if (!res.ok) {
    throw new Error('Failed to fetch logged in user');
  }
  const data = await res.json();
  return data.user as User;

}

export async function fetchAccount(userId: string) {
  const authHeader = getAuthorizationHeader();
  if (!authHeader) throw new Error('No auth token found');

  const res = await fetchApi(`/users/${userId}`,{
    headers: authHeader
  });

  if (!res.ok) {
    throw new Error('Failed to fetch user data');
  }
  const data = await res.json();
  return data[0] as User;
}

export async function fetchEmail(userId: string) {
  const authHeader = getAuthorizationHeader();
  if (!authHeader) throw new Error('No auth token found');

  const res = await fetchApi(`/users/${userId}/email`, {
    headers: authHeader
  });

  if (!res.ok) {
    throw new Error('Failed to fetch user email');
  }
  const data = await res.json();
  return data.email;
}

export async function fetchAllEmployees() {
  const authHeader = getAuthorizationHeader();
  if (!authHeader) throw new Error('No auth token found');

  const res = await fetchApi('/users', {
    headers: authHeader
  });

  if (!res.ok) {
    throw new Error('Failed to fetch users data');
  }
  const data = await res.json();
  return data as User[];
}

export async function fetchAllUsers() {
  const authHeader = getAuthorizationHeader();
  if (!authHeader) throw new Error('No auth token found');

  const res = await fetchApi('/users', {
    headers: authHeader
  });

  if (!res.ok) {
    throw new Error('Failed to fetch users data');
  }
  const data = await res.json();
  return data;
}

export async function fetchUsersPayRate(user_id: string, date:dayjs.Dayjs) {
  const authHeader = getAuthorizationHeader();
  if (!authHeader) throw new Error('No auth token found');

  const isWeekday = date.day()>0 && date.day()<6;
  const isSaturday = date.day()===6;
  const isSunday = date.day()===0;

  
  const res =  await fetchApi('/payrates/user/'+user_id, {
    headers: authHeader
  });

  if (!res.ok) {
    throw new Error('This user has not been assigned to a job position!');
  }
  const data = await res.json();

  const payRate = (data[0] as {weekday:number, saturday: number, sunday:number, public_holiday: number});
  const rate = (isWeekday?payRate.weekday:isSaturday?payRate.saturday:isSunday?payRate.sunday:payRate.public_holiday);
  return rate;
}

export async function fetchPayRates(pay_rate_id?: string) {
  const authHeader = getAuthorizationHeader();
  if (!authHeader) throw new Error('No auth token found');

  const res = pay_rate_id ? await fetchApi('/payrates/'+pay_rate_id, {
    headers: authHeader
  }) : await fetchApi('/payrates', {
    headers: authHeader
  });

  if (!res.ok) {
    throw new Error('Failed to fetch pay rates data');
  }
  const data = await res.json();
  return data as PayRate[];
}

export async function addNewUser(user:User, with_other_fields = false, assign_position = false) {
  try{
    const authHeader = getAuthorizationHeader();
    if (!authHeader) throw new Error('No auth token found');

    const res = await fetchApi(`/users`,  {
      method: 'PUT',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({...user, with_other_fields, assign_position}),
    });

    const data = await res.json();

    if (!res.ok) {
      const message = data.error || `Request failed with status ${res.status}`;
      return { success: false, err: message };
    }
    
    return { success: true, new_id: data.new_id };
  } catch (err) {
    console.error("Failed to add new pay rate:", err);
    const message =  err instanceof Error ? err.message : typeof err === "string" ? err : "";
    console.log(message);
    console.log(err);
    return { success: false, err: message };
  }
}

export async function updateUser(user: User) {
  try{
    const authHeader = getAuthorizationHeader();
    if (!authHeader) throw new Error('No auth token found');

    const res = await fetchApi(`/users/${user.id}`,  {
      method: 'PATCH',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to update shift status:', err);
    return false;
  }
}

export async function deleteUser(email:string) {
  try{
    const authHeader = getAuthorizationHeader();
    if (!authHeader) throw new Error('No auth token found');

    const res = await fetchApi(`/users/`,  {
      method: 'DELETE',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({email}),
    });

    const { success } = await res.json();
    return success;
    
  } catch (err) {
    console.error("Failed to delete user:", err);
    return false;
  }
}

export async function updatePassword(user_id: string, password: string) {
  try{
    const authHeader = getAuthorizationHeader();
    if (!authHeader) throw new Error('No auth token found');

    const res = await fetchApi(`/users/${user_id}/password`,  {
      method: 'PATCH',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({password}),
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to update user password:', err);
    return false;
  }
}

export async function updateUsersPayRate(user_id: string, job_title: string, age_group: string, level: string, specialty?:string) {
  try{
    const authHeader = getAuthorizationHeader();
    if (!authHeader) throw new Error('No auth token found');

    const res = await fetchApi(`/users/${user_id}/update_pay_rate`,  {
      method: 'PATCH',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
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

export async function updatePayRate(pay_rate:PayRate) {
  try{
    const authHeader = getAuthorizationHeader();
    if (!authHeader) throw new Error('No auth token found');

    const res = await fetchApi(`/payrates/${pay_rate.id}`,  {
      method: 'PATCH',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(pay_rate),
    });

    const { success } = await res.json();
    return success;
  } catch (err) {
    console.error("Failed to update pay rate:", err);
    return false;
  }
}

export async function insertPayRate(pay_rate:PayRate) {
  try{
    const authHeader = getAuthorizationHeader();
    if (!authHeader) throw new Error('No auth token found');

    const res = await fetchApi(`/payrates`,  {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(pay_rate),
    });

    const { success, new_id } = await res.json();
    if(success)
      return new_id;
    else return false;
    
  } catch (err) {
    console.error("Failed to add new pay rate:", err);
    return false;
  }
}

export async function deletePayRate(pay_rate_id:string) {
  try{
    const authHeader = getAuthorizationHeader();
    if (!authHeader) throw new Error('No auth token found');

    const res = await fetchApi(`/payrates/`+pay_rate_id,  {
      method: 'DELETE',
      headers: authHeader
    });

    const { success } = await res.json();
    return success;
    
  } catch (err) {
    console.error("Failed to delete pay rate:", err);
    return false;
  }
}