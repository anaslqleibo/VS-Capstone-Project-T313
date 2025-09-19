// Copied from CRM Team with a few adjustments to compensate missing components and support design consistency

"use client";
import { useEffect, useRef, useState } from "react";
import Button from "@/app/components/Button";
import Input from "@/app/components/Input";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Layout from "@/app/components/Layout";
import Spinner from "@/app/components/Spinner";
import Icon from "@/public/icons/Icons";
import Toast from "@/app/components/Toast";
import Dropdown from "@/app/components/Dropdown";
import { fetchAllUsers, User } from "@/app/controllers/User";
import { FaDollarSign, FaEdit } from "react-icons/fa";
import dayjs from "dayjs";
import Modal from "@/app/components/Modal";


type UserExtended = User & {
  job_title: string
}

export default function UsersPage() {
const modalContainer = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setUserSelected] = useState<User | null>(null);
  const [activeFilter, setActiveFilter] = useState<string[]>(['Name','Preferred name','Email','Phone']);

  // Check if user is authenticated and has admin role
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (user?.role !== 'admin') {
      router.push('/');
      return;
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    // Only fetch users if user is admin
    if (user?.role === 'admin') {

      fetchAllUsers().then(data => {
          setUsers(Array.isArray(data) ? data : []);
          setLoading(false);
        });
    }
  }, [user]);

  // If not authenticated or not admin, show loading or redirect
  if (!isAuthenticated) {
    return <div className="p-8">Redirecting to login...</div>;
  }

  if (user?.role !== 'admin') {
    return <div className="p-8">Access denied. Redirecting...</div>;
  }

  const handleAddUser = async () => {
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    setShowAddDialog(false);
    displayToast('Succesfully added new ' + newUser.role + '!', 'success');

    setNewUser({ first_name: "", last_name: "", email: "", password: "", role: "user" });
    const updated = await fetch("/api/users").then(res => res.json()); 
    setUsers(Array.isArray(updated) ? updated : []);
  };

  const handleDisableUser = async (id: number) => {
    await fetch(`/api/users/${id}`, { method: "PUT", body: JSON.stringify({ is_active: false }) });
    setUsers(users.map(u => u.id === id ? { ...u, is_active: 0 } : u));
  };

  const handleDeleteUser = async (email: string) => {
    await fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setUsers(users.filter(u => u.email !== email));
    setShowDeleteDialog(false);
    displayToast('Succesfully deleted account with email ' + email + '!', 'success');

    setUserSelected(null);
  };
  const [modalType, setModalType] = useState<'create'|'update'|'delete'|'view'>('create');
  const [openModal, setOpenModal] = useState(false);
  const [showToast, setToastShown] = useState(false);
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState<"success"|"error">("success");

  const displayToast = (message: string, toastType: "success"|"error") => {
      setMessage(message);
      setToastType(toastType);
      setToastShown(true);
  }

  const filterItems = ['Name','Preferred name','Email','Phone','Date of birth','Age','Address','Gender','Emergency Contact Person','Emergency Contact Number', 'Job Title'];
  const fieldMap: Record<string, keyof User> = {
    "Name": "first_name",
    "Preferred name": "preferred_name",
    "Email": "email",
    "Phone": "phone",
    "Date of birth": "date_of_birth",
    "Address": "address",
    "Gender": "gender",
    "Emergency Contact Person": "emergency_person",
    "Emergency Contact Number": "emergency_contact",
    "Job Title": "job_title"
  };

  
  const sortedFilters = [...activeFilter].sort(
    (a, b) => filterItems.indexOf(a) - filterItems.indexOf(b)
  );



  return (
    <Layout modalContainer={modalContainer}>
       <Toast message={message} type={toastType} shown={showToast} setShown={setToastShown}/>
              
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>
      <Button onClick={() => setShowAddDialog(true)} className="w-fit">Add new user</Button>

      </div>
      
    <div className="flex gap-2 items-center w-full mt-6">
      Filter column: 
      <Dropdown items={filterItems} multiple placeholder="Select columns" className="min-w-48 max-w-200" showCheckbox actAsFilter setFilter={(e:string[])=>setActiveFilter(e)} initialSelectedItem={['Name', 'Email', 'Phone']} preventEmptySelection={true}></Dropdown>
    </div>
      {loading ? <Spinner/> :
        <div className="min-h-64 mt-4 overflow-y-auto">
      <table className="w-full border-x border-b border-separate border-spacing-0">
        <thead>
          <tr className="bg-gray-200">
            {sortedFilters.map((field, index) => (
            <th key={index} className="bg-gray-200 p-2 sticky top-0 z-10 border-y">{field}</th>
              
            ))}
            <th className="bg-gray-200 p-2 sticky top-0 z-10 border-y">Action</th>

          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-t odd:bg-gray-100 even:bg-gray-200">
              {sortedFilters.map((field) => {
                if (field === "Name") {
                  return (
                    <td key={field} className="p-2">
                      {u.first_name} {u.last_name}
                    </td>
                  );
                }

                if (field === "Age"){
                  return (
                    <td key={field.toString()} className="p-2">
                      {u.date_of_birth ? dayjs().year()-Number(u.date_of_birth.split('/')[2]) : '-'}
                    </td>
                  );
                }

                const key = fieldMap[field];
                return (
                  <td key={field} className="p-2">
                    {u[key] ?? "-"}
                  </td>
                );
              })}
              <td className="p-2 flex gap-2 justify-center items-center">
                {/* <Button type="outline" size="sm" onClick={() => handleDisableUser(u.id)}>
                  Disable
                </Button> */}
                <Button className="bg-success hover:bg-success-hover p-3 h-fit" onClick={() => { setUserSelected(u); setModalType('view'); setOpenModal(true)}}>
                  <FaDollarSign/>
                </Button>
                <Button className="bg-secondary hover:bg-secondary-hover p-3 h-fit" onClick={() => { setUserSelected(u); setModalType('update'); setOpenModal(true)}}>
                  <FaEdit/>
                </Button>
                <Button className="bg-danger hover:bg-danger-hover p-3 h-fit" onClick={() => { setUserSelected(u); setModalType('delete'); setOpenModal(true)}}>
                  <Icon id='trash'/>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      }

      { modalContainer.current && 
        <Modal details={{}} shown={openModal} setShown={setOpenModal} modalContainer={modalContainer.current} setParentOpen={setOpenModal} displayToast={displayToast} title={modalType==="delete"?'Delete user confirmation':modalType==="create"?'Create new user':modalType==='update'?"Modify user details":'View pay rates'}>
          {selectedUser && modalType === 'delete' && 
          <div>
          <p className="mb-6">
              Are you sure you want to delete <span className="font-semibold">{selectedUser.first_name} {selectedUser.last_name}</span> ({selectedUser.email})?
            </p>
            <div className="flex justify-end gap-2">
              <Button type="outline" onClick={() => setShowDeleteDialog(false)}>No</Button>
              <Button
                onClick={() => handleDeleteUser(selectedUser.email)}
              >
                Yes
              </Button>
            </div>
          </div>
          }

        </Modal>
      }
      

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded shadow max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Delete User</h2>
            
          </div>
        </div>
      )}

      {/* Add User Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded shadow max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add User</h2>
            <Input placeholder="First Name" value={newUser.first_name} onChange={e => setNewUser({ ...newUser, first_name: e.target.value })} className="mb-2" />
            <Input placeholder="Last Name" value={newUser.last_name} onChange={e => setNewUser({ ...newUser, last_name: e.target.value })} className="mb-2" />
            <Input placeholder="Email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="mb-2" />
            <Input placeholder="Password" type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="mb-2" />
            <label className="block mb-2 font-medium">Role</label>
            <select
              value={newUser.role}
              onChange={e => setNewUser({ ...newUser, role: e.target.value })}
              className="mb-4 w-full border rounded p-2"
              aria-label="Select user role"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex justify-end gap-2">
              <Button type="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={handleAddUser}>Add</Button>
            </div>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
}