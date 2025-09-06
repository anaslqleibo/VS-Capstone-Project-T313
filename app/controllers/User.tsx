// Temporary utility class to detect account access, can be replaced later
export type Role = "admin" | "user";
export type User = {
    id: number;
    last_name: string;
    first_name: string;
    email: string;
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