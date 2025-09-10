// Temporary utility class to detect account access, can be replaced later
export type Role = "admin" | "user";
export type User = {
    id: number;
    last_name: string;
    first_name: string;
    email: string;
    phone?: string;
    role: Role;
};

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

export async function updateUser(user: User) {
  try{
    const res = await fetch(`/api/users/${user.id}`,  {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_name: user.first_name===''?undefined:user.first_name, last_name: user.last_name===''?undefined:user.last_name, email: user.email===''?undefined:user.email, phone: user.phone===''?undefined:user.phone }),
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to update shift status:', err);
    return false;
  }
}