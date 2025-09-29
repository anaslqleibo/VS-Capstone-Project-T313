// Copied from CRM Team with a few adjustments to compensate missing components and support design consistency

"use client";
import { useEffect, useRef, useState } from "react";
import Button from "@/app/components/Button";
import Input, { InputIcon } from "@/app/components/Input";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Layout from "@/app/components/Layout";
import Spinner from "@/app/components/Spinner";
import Icon from "@/public/icons/Icons";
import Toast from "@/app/components/Toast";
import Dropdown from "@/app/components/Dropdown";
import { fetchAllUsers, fetchPayRates, PayRate, updatePayRate, User } from "@/app/controllers/User";
import { FaDollarSign, FaEdit } from "react-icons/fa";
import dayjs from "dayjs";
import Modal from "@/app/components/Modal";
import Tooltip from "@/app/components/Tootltip";


type UserExtended = User & {
  job_title: string
}


export default function UsersPage() {
const modalContainer = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [payRates, setPayRates] = useState<PayRate[]>([]);
  const [activePage, setActivePage] = useState<'users'|'pay-rates'>('users');

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setUserSelected] = useState<User | null>(null);
  const [activeFilter, setActiveFilter] = useState<string[]>(['Name','Email','Phone']);
  
  const [selectedPayRate, setSelectedPayRate] = useState<PayRate|null>(null);
  const [payRateLoading, setPayRateLoading] = useState(false);
  const [editingPayRate, setEditingPayRate] = useState(false);

  // Check if user is authenticated and has admin role
  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     router.push('/login');
  //     return;
  //   }
    
  //   if (user?.role !== 'admin') {
  //     router.push('/');
  //     return;
  //   }
  // }, [isAuthenticated, user, router]);

  useEffect(() => {
    // Only fetch users if user is admin
    if (user?.role === 'admin') {

      fetchAllUsers().then(data => {
          setUsers(Array.isArray(data) ? data : []);
          setLoading(false);
        });
    }
  }, [user]);


  useEffect(()=>{
    if ((activePage === 'pay-rates' || editingPayRate) && payRates.length === 0){
      (async () => {
        const res = await fetchPayRates();
        setPayRates(res);

      })();
    }
  },[activePage, editingPayRate])

  // If not authenticated or not admin, show loading or redirect
  // if (!isAuthenticated) {
  //   return <div className="p-8">Redirecting to login...</div>;
  // }

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
    setOpenModal(false);
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

  useEffect(()=>{
    const fetchPayRateDetails = async () => {
      if (selectedUser){
        if (selectedUser.pay_rate_id){
          try{
            setPayRateLoading(true);
            const payRate = await fetchPayRates(selectedUser.pay_rate_id);
            setSelectedPayRate(payRate[0]);
          }
          finally{
            setPayRateLoading(false);
          }
          
        } 
        else setSelectedPayRate(null);
      }
    }
    fetchPayRateDetails();  
    
  }, [selectedUser])


  const exportToCSV = () => {
    if (!payRates.length) return;

    const headers = Object.keys(payRates[0]);

    const rows = payRates.map((row) =>
      headers.map((header) => `"${(row as any)[header]}"`).join(",")
    );

    const csvContent = [headers.map((header)=>header.includes('_')?(header.split('_').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')):(header.charAt(0).toUpperCase() + header.slice(1))).join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "payrates.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  const specialtyList = (selectedPayRate && selectedPayRate.age_group && selectedPayRate.job_title && selectedPayRate.level) ? [...(new Set((payRates.filter(data=>data.job_title === selectedPayRate.job_title && data.age_group === selectedPayRate.age_group && data.level.toString() === selectedPayRate.level.toString())).map(payRate=>payRate.specialty?payRate.specialty:'-')))] : undefined;

  const handleUpdatePayRate = () => {
    
    if (!selectedPayRate?.job_title || !selectedPayRate.age_group || !selectedPayRate.level) return;

    (async ()=>{
      try{
        if (selectedUser){
          const result = await updatePayRate(selectedUser.id.toString(), selectedPayRate?.job_title, selectedPayRate?.age_group, selectedPayRate?.level.toString(), selectedPayRate?.specialty);
          if (result){
            displayToast(`Succesfully ${selectedUser?.pay_rate_id ? "updated" : "assigned"} user's pay rates!`, 'success');

            if (selectedUser) {
              setUserSelected({...selectedUser, pay_rate_id: result});
              setUsers((prev)=>[...prev.filter(u=>u.id!==selectedUser.id), {...selectedUser, pay_rate_id: result}])
            }

          }
          else displayToast(`Fail to ${selectedUser?.pay_rate_id ? "update" : "assign"} user's pay rates.`, 'error');
        }
        else displayToast(`No selected user found.`, 'error');
      }
      finally{
        setEditingPayRate(false);
      }
    })();
    
  }
  return (
    <Layout modalContainer={modalContainer}>
       <Toast message={message} type={toastType} shown={showToast} setShown={setToastShown}/>
              
      <div className="p-4 h-full flex flex-col">
        <div className="flex flex-col md:flex-row gap-2 md:gap-0 items-start md:items-center justify-between">
          <h1 className="text-3xl font-bold">{activePage==='users'?'User':"Pay Rate"} Management</h1>
          
          <div className="flex gap-2 text-xs md:text-sm">
            <Button onClick={() => setActivePage(prev=>prev==='users'?'pay-rates':'users')} className="w-fit py-2 font-semibold" type='outline'>View {activePage==='users'?'pay rates':'users'}</Button>
            <Button onClick={() => {setModalType('create'); setOpenModal(true);}} className="w-fit py-2 px-6">Add new {activePage.substring(0,activePage.length-1)}</Button>

          </div>

      </div>
        
      {activePage === 'pay-rates' ? <div className="mt-6 -mb-6 text-gray-700">Hover over the job title to see all assigned employees with that job title</div> : ''}

      {activePage === 'users' ? 
      <>
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
      </>
      : 
      <div className="mt-8 h-full">
        <div className="h-100 overflow-y-auto">
          { payRates.length>0 ? 
          <table className="w-full border-separate border-spacing-0 border-black">
            <thead>
              <tr>
                <th className="bg-gray-200 p-2 sticky top-0 z-10 border-y border-l">Job Title</th>
                <th className="bg-gray-200 p-2 sticky top-0 z-10 border-y">Age Group</th>
                <th className="bg-gray-200 p-2 sticky top-0 z-10 border-y">Level</th>
                <th className="bg-gray-200 p-2 sticky top-0 z-10 border-y">Specialty</th>
                <th className="bg-gray-200 p-2 sticky top-0 z-10 border-y">Weekday</th>
                <th className="bg-gray-200 p-2 sticky top-0 z-10 border-y">Saturday</th>
                <th className="bg-gray-200 p-2 sticky top-0 z-10 border-y">Sunday</th>
                <th className="bg-gray-200 p-2 sticky top-0 z-10 border-y">Public Holiday</th>
                <th className="bg-gray-200 p-2 sticky top-0 z-10 border-y border-r">Action</th>

              </tr>
            </thead>
            <tbody>
              {payRates.map((row, index) => (
                <tr key={index}>
                  <td className="border px-2 py-1 border-light-grey text-secondary font-medium ">
                    <Tooltip key={index} textWhenContentEmpty='No user has this position' content={
                        users.filter((user)=>user.pay_rate_id === row.id).length>0?users.filter((user)=>user.pay_rate_id === row.id).map((user,idx)=><div key={idx}>{user.first_name + ' ' + user.last_name}</div>):''
                    }>{row.job_title}</Tooltip>
                  </td>
                  <td className="border px-2 py-1 border-light-grey">{row.age_group}</td>
                  <td className="border px-2 py-1 border-light-grey">{row.level}</td>
                  <td className="border px-2 py-1 border-light-grey">{row.specialty}</td>
                  <td className="border px-2 py-1 border-light-grey">${row.weekday?row.weekday.toFixed(2):'-'}</td>
                  <td className="border px-2 py-1 border-light-grey">${row.saturday?row.saturday.toFixed(2):'-'}</td>
                  <td className="border px-2 py-1 border-light-grey">${row.sunday?row.sunday.toFixed(2):'-'}</td>
                  <td className="border px-2 py-1 border-light-grey">${row.public_holiday?row.public_holiday.toFixed(2):'-'}</td>
                  <td className="border px-2 py-1 border-light-grey">
                    <div className="flex gap-2 justify-center items-center text-sm">
                      <Button className="bg-secondary hover:bg-secondary-hover h-full p-2" onClick={() => { setSelectedPayRate(row); setModalType('update'); setOpenModal(true)}}>
                    <FaEdit/>
                    </Button>
                    <Button className="bg-danger hover:bg-danger-hover h-full p-2" onClick={() => { setSelectedPayRate(row); setModalType('delete'); setOpenModal(true)}}>
                      <Icon id='trash'/>
                    </Button>
                    </div>
                </td>
                </tr>
              )) }

            </tbody>
          </table>
          : <Spinner />}
        </div>
      
      <Button onClick={exportToCSV} className="mt-2 px-4 py-2 text-white rounded">
        Export CSV
      </Button>
      </div>

      }
      

      { modalContainer.current && 
        <Modal details={{}} shown={openModal} setShown={setOpenModal} modalContainer={modalContainer.current} onClose={()=>setEditingPayRate(false)} setParentOpen={setOpenModal} displayToast={displayToast} title={modalType==="delete"?'Delete '+ activePage.substring(0,activePage.length-1) +' confirmation':modalType==="create"?'Create new '+activePage.substring(0,activePage.length-1) :modalType==='update'?"Modify "+ activePage.substring(0,activePage.length-1) +" details":'Manage pay rates'}>
          {selectedUser && modalType === 'delete'  && activePage === 'users' &&
          <div>
          <p className="mb-6">
              Are you sure you want to delete <span className="font-medium text-secondary">{selectedUser.first_name} {selectedUser.last_name}</span> ({selectedUser.email})?
            </p>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setOpenModal(false)}>No</Button>
              <Button type='outline'
                onClick={() => handleDeleteUser(selectedUser.email)}
              >
                Yes
              </Button>
            </div>
          </div>
          }

          {selectedPayRate && modalType === 'delete' && activePage === 'pay-rates' &&
          <div>
          <p className="mb-6">
              Are you sure you want to delete <span className="font-medium text-secondary">{selectedPayRate.job_title}-{selectedPayRate.age_group}-{'Level ' + selectedPayRate.level}{selectedPayRate.specialty?'-'+selectedPayRate.specialty:''}?</span>
            </p>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setOpenModal(false)}>No</Button>
              <Button type='outline'>Yes
              </Button>
            </div>
          </div>
          }

          {selectedUser && modalType === 'view' && 

          ((selectedUser?.pay_rate_id || editingPayRate) ? 
          (payRateLoading ? <div className="m-10 flex relative">&nbsp;<Spinner/></div> : 
            ( editingPayRate ? 
              <div className="text-md flex flex-col gap-2 mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-primary font-semibold w-24 text-right">Staff: </span>{selectedUser.first_name + ' ' + selectedUser.last_name}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-semibold w-24 text-right">Job title: </span>
                  <Dropdown className="min-w-40" items={[...(new Set(payRates.map(data=>data.job_title)))]} initialSelectedItem={selectedPayRate ? selectedPayRate.job_title : undefined} onChange={(e)=>{selectedPayRate ? setSelectedPayRate({...selectedPayRate, job_title: e}) : setSelectedPayRate({id:'',job_title: e, age_group:'',level:0});
                  if (selectedPayRate && e!==selectedPayRate.job_title) setSelectedPayRate({id:'',job_title: e, age_group:'',level:0});
                  }} disableTyping placeholder="Select job title"/>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-semibold w-24 text-right">Age Group: </span>
                  <Dropdown className="min-w-40" items={(selectedPayRate && selectedPayRate.job_title) ? [...(new Set((payRates.filter(data=>data.job_title === selectedPayRate.job_title)).map(payRate=>payRate.age_group)))] : undefined} initialSelectedItem={selectedPayRate ? selectedPayRate.age_group : undefined} disableTyping disabled={!selectedPayRate || !selectedPayRate.job_title} syncCurrentWithInitialSelected={true} openWhenNoItemIsSelected={false} onChange={(e)=>selectedPayRate&&setSelectedPayRate({...selectedPayRate, level: 0, age_group: e})} placeholder="Select age group"/>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-semibold w-24 text-right">Level: </span>
                  <Dropdown className="min-w-40" items={(selectedPayRate && selectedPayRate.age_group && selectedPayRate.job_title) ? [...(new Set((payRates.filter(data=>data.job_title === selectedPayRate.job_title && data.age_group === selectedPayRate.age_group)).map(payRate=>payRate.level.toString())))] : undefined} initialSelectedItem={(selectedPayRate &&  selectedPayRate.level) ? selectedPayRate.level.toString() : undefined} syncCurrentWithInitialSelected={true} openWhenNoItemIsSelected={false} disableTyping disabled={!selectedPayRate || !selectedPayRate.age_group} onChange={(e)=>selectedPayRate&&setSelectedPayRate({...selectedPayRate, level: e, specialty: ''})} placeholder="Select level"/>
                </div>

                {(specialtyList?.length === 1 && specialtyList[0] === '-') || !specialtyList ? '' :
                <div className="flex items-center gap-2">
                  <span className="text-primary font-semibold w-24 text-right">Specialty: </span>
                  
                  <Dropdown className="min-w-40" items={specialtyList} initialSelectedItem={(selectedPayRate && selectedPayRate.specialty) ? selectedPayRate.specialty : undefined} syncCurrentWithInitialSelected={true} openWhenNoItemIsSelected={false} disableTyping disabled={!selectedPayRate || !selectedPayRate.level} placeholder="Select optional specialty" onChange={(e)=>selectedPayRate&&setSelectedPayRate({...selectedPayRate, specialty:e})}/>
                  
                  
                </div>}

                <div className="flex flex-row-reverse items-end justify-between">
                  <Button className="w-fit mt-5 py-2 px-4" fontSize="0.9em" onClick={()=>setEditingPayRate(false)}>Cancel</Button>
                  {
                    selectedPayRate && selectedPayRate.level && selectedPayRate.age_group && selectedPayRate.job_title ?
                    <Button className="w-fit mt-5 py-2 px-4" fontSize="0.9em" onClick={handleUpdatePayRate}>Save</Button> : ''
                  }
                </div>
              </div>
              :
              (selectedPayRate &&
            <div className="text-md flex flex-col gap-1">
              <div><span className="text-primary font-semibold">Job title: </span>{selectedPayRate.job_title}</div>
              <div><span className="text-primary font-semibold">Age group: </span>{selectedPayRate.age_group}</div>
              <div><span className="text-primary font-semibold">Level: </span>{selectedPayRate.level}</div>
              {selectedPayRate.specialty && <div><span className="text-primary font-semibold">Specialty: </span>{selectedPayRate.specialty}</div>}
              <div>
                <span className="text-primary font-semibold">Pay rate:</span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 w-fit">
                  <div>
                    <span className="text-sm font-semibold">Weekday</span>
                    <InputIcon readOnly={true} className="w-fit md:w-40" placeholder="Pay" type="icon left filled" icon="$" value={selectedPayRate.weekday ? selectedPayRate.weekday.toPrecision(4) : '-'} onChange={()=>{}}/>
                  </div>
                  <div>
                    <span className="text-sm font-semibold">Saturday</span>
                    <InputIcon readOnly={true} className="w-fit md:w-40" placeholder="Pay" type="icon left filled" icon="$" value={selectedPayRate.saturday ? selectedPayRate.saturday.toPrecision(4) : '-'} onChange={()=>{}}/>
                  </div>
                  <div>
                    <span className="text-sm font-semibold">Sunday</span>
                    <InputIcon readOnly={true} className="w-fit md:w-40" placeholder="Pay" type="icon left filled" icon="$" value={selectedPayRate.sunday ? selectedPayRate.sunday.toPrecision(4) : '-'} onChange={()=>{}}/>
                  </div>
                  <div>
                    <span className="text-sm font-semibold">Public Holiday</span>
                    <InputIcon readOnly={true} className="w-fit md:w-40" placeholder="Pay" type="icon left filled" icon="$" value={selectedPayRate.public_holiday ? selectedPayRate.public_holiday.toPrecision(4) : '-'} onChange={()=>{}}/>
                  </div>
                </div>            
              </div>

              <div className="flex flex-col items-end">
                <Button className="w-fit mt-5 py-2 px-4" fontSize="0.9em" onClick={()=>setEditingPayRate(true)}>Update position</Button>
              </div>
            </div>))
          )
          : 
          <>
            No pay rates has been assigned to this user.


            <Button className="float-end mb-5 mt-5 py-2 px-4" fontSize="0.9em" onClick={()=>setEditingPayRate(true)}>Assign position</Button>
          </>)
          }

          {selectedPayRate && modalType === 'update' && activePage==='pay-rates' && 
            <div className="text-md flex flex-col gap-2 mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-primary font-semibold w-24 text-right">Job title: </span>
                  <Input className="min-w-40"  value={selectedPayRate ? selectedPayRate.job_title : undefined} onChange={(e)=>{selectedPayRate ? setSelectedPayRate({...selectedPayRate, job_title: e.target.value}):undefined}} placeholder="Update job title"/>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-semibold w-24 text-right">Age Group: </span>
                  <Input className="min-w-40" value={selectedPayRate ? selectedPayRate.age_group : undefined} onChange={(e)=>selectedPayRate&&setSelectedPayRate({...selectedPayRate, age_group: e.target.value})} placeholder="Update age group"/>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-semibold w-24 text-right">Level: </span>
                  <Input className="min-w-40"  value={(selectedPayRate &&  selectedPayRate.level) ? selectedPayRate.level.toString() : undefined} onChange={(e)=>selectedPayRate&&setSelectedPayRate({...selectedPayRate, level: e.target.value, specialty: ''})} placeholder="Update level"/>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-primary font-semibold w-24 text-right">Specialty: </span>
                  
                  <Input className="min-w-40" value={(selectedPayRate && selectedPayRate.specialty) ? selectedPayRate.specialty : undefined} placeholder="Optional specialty field" onChange={(e)=>selectedPayRate&&setSelectedPayRate({...selectedPayRate, specialty: e.target.value})}/>
                </div>

                <div className="flex flex-row-reverse items-end justify-between">
                  <Button className="w-fit mt-5 py-2 px-4" fontSize="0.9em" onClick={()=>setEditingPayRate(false)}>Cancel</Button>
                  {
                    selectedPayRate && selectedPayRate.level && selectedPayRate.age_group && selectedPayRate.job_title ?
                    <Button className="w-fit mt-5 py-2 px-4" fontSize="0.9em" onClick={handleUpdatePayRate}>Save</Button> : ''
                  }
                </div>
              </div>
          
          }

          {modalType === 'create' && activePage==='pay-rates' && 
            <div className="text-md flex flex-col gap-2 mt-4">
        
              <div className="flex items-center gap-2">
                <span className="text-primary font-semibold w-30 text-right after:ml-0.5 after:text-red-500 after:content-['*']">Job title: </span>
                <Input className="min-w-40" placeholder="Enter the job job title"/>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary font-semibold w-30 text-right after:ml-0.5 after:text-red-500 after:content-['*']">Age Group: </span>
                <Input className="min-w-40" placeholder="Enter the age group"/>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary font-semibold w-30 text-right after:ml-0.5 after:text-red-500 after:content-['*']">Level: </span>
                <Input className="min-w-40" placeholder="Enter the level"/>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-primary font-semibold w-30 text-right">Specialty: </span>
                <Input className="min-w-40" placeholder="Enter the specialty (optional)"/>
              </div>

              <div className="flex flex-row-reverse items-end justify-between">
                <Button className="w-fit mt-5 py-2 px-4" fontSize="0.9em" onClick={()=>setEditingPayRate(false)}>Cancel</Button>
                {
                  selectedPayRate && selectedPayRate.level && selectedPayRate.age_group && selectedPayRate.job_title ?
                  <Button className="w-fit mt-5 py-2 px-4" fontSize="0.9em" onClick={handleUpdatePayRate}>Save</Button> : ''
                }
              </div>
            </div>
          }


          {modalType === 'create' && activePage==='users' && 
            <div className="text-md flex flex-col gap-2 mt-4">
        
              <div className="flex items-center gap-2">
                <span className="text-primary font-semibold w-30 text-right after:ml-0.5 after:text-red-500 after:content-['*']">First Name: </span>
                <Input className="min-w-40" placeholder="Enter the job job title"/>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary font-semibold w-30 text-right after:ml-0.5 after:text-red-500 after:content-['*']">Last Name: </span>
                <Input className="min-w-40" placeholder="Enter the age group"/>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary font-semibold w-30 text-right after:ml-0.5 after:text-red-500 after:content-['*']">Email: </span>
                <Input className="min-w-40" placeholder="Enter the level"/>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-primary font-semibold w-30 text-right">Temporary Password: </span>
                <Input className="min-w-40" placeholder="Enter the specialty (optional)"/>
              </div>

              <div className="flex flex-row-reverse items-end justify-between">
                <Button className="w-fit mt-5 py-2 px-4" fontSize="0.9em" onClick={()=>setEditingPayRate(false)}>Cancel</Button>
                {
                  selectedPayRate && selectedPayRate.level && selectedPayRate.age_group && selectedPayRate.job_title ?
                  <Button className="w-fit mt-5 py-2 px-4" fontSize="0.9em" onClick={handleUpdatePayRate}>Save</Button> : ''
                }
              </div>
            </div>
          }

        </Modal>
      }
      
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