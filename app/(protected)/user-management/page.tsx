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
import { addNewUser, deletePayRate, deleteUser, fetchAllUsers, fetchPayRates, insertPayRate, PayRate, updatePayRate, updateUser, updateUsersPayRate, User } from "@/app/controllers/User";
import { FaDollarSign, FaEdit } from "react-icons/fa";
import dayjs from "dayjs";
import Modal from "@/app/components/Modal";
import Tooltip from "@/app/components/Tootltip";
import Form from "@/app/components/Form";
import { formatToSqlDate, sqlDateFormatToRegularFormat } from "@/app/components/utils/formatDate";
import Checkbox from "@/app/components/Checkbox";
import useIsOverMd from "@/app/components/utils/useIsOverMd";


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
  const [modalLoading, setModalLoading] = useState(false);
  const [editingPayRate, setEditingPayRate] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [showAssignPositionField, setShowAssignPositionField] = useState(false);
  const [newUserAdmin, setNewUserAdmin] = useState(false);

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
    if ((activePage === 'pay-rates' || editingPayRate || showAssignPositionField) && payRates.length === 0){
      (async () => {
        const res = await fetchPayRates();
        setPayRates(res);

      })();
    }
  },[activePage, editingPayRate, showAssignPositionField])

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
            setModalLoading(true);
            const payRate = await fetchPayRates(selectedUser.pay_rate_id);
            setSelectedPayRate(payRate[0]);
          }
          finally{
            setModalLoading(false);
          }
          
        } 
        else setSelectedPayRate(null);
      }
    }
    fetchPayRateDetails();  
    
  }, [selectedUser])

  useEffect(()=>{
    if (!openModal){
      setUserSelected(null);
      setSelectedPayRate(null);
      setShowOptionalFields(false);
      setNewUserAdmin(false);
      setShowAssignPositionField(false);
    }
  }, [openModal])


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

  const handleUpdateUsersPayRate = () => {
    
    if (!selectedPayRate?.job_title || !selectedPayRate.age_group || !selectedPayRate.level) return;

    if (activePage === 'users'){
      (async ()=>{
        try{
          if (selectedUser){
            setModalLoading(true);
            const result = await updateUsersPayRate(selectedUser.id.toString(), selectedPayRate?.job_title, selectedPayRate?.age_group, selectedPayRate?.level.toString(), selectedPayRate?.specialty);
            if (result){
              displayToast(`Succesfully ${selectedUser?.pay_rate_id ? "updated" : "assigned"} user's pay rates!`, 'success');

              if (selectedUser) {
                setUserSelected({...selectedUser, pay_rate_id: result, job_title: selectedPayRate.job_title});
                setUsers((prev)=>prev.map(u=>u.id===selectedUser.id?{...selectedUser, pay_rate_id: result, job_title: selectedPayRate.job_title}:u)); 
              }

            }
            else displayToast(`Fail to ${selectedUser?.pay_rate_id ? "update" : "assign"} user's pay rates.`, 'error');
          }
          else displayToast(`No selected user found.`, 'error');
        }
        finally{
          setEditingPayRate(false);
          setModalLoading(false);
        }
      })();
    }
  }

  const processPayRate = (payRate?:any) => {
    (async ()=>{
      if (modalType==='update' && selectedPayRate){
        if (selectedPayRate.job_title === payRate.job_title && selectedPayRate.age_group === payRate.age_group && selectedPayRate.level === payRate.level && selectedPayRate.specialty === payRate.specialty && selectedPayRate.weekday?.toPrecision(4) === payRate.weekday && selectedPayRate.saturday?.toPrecision(4) === payRate.saturday && selectedPayRate.sunday?.toPrecision(4) === payRate.sunday && selectedPayRate.public_holiday?.toPrecision(4) === payRate.public_holiday){
          setOpenModal(false);
          return;
        }

        const updatedPayRate : PayRate = {...{...payRate, weekday: Number(payRate.weekday), saturday: Number(payRate.saturday), sunday: Number(payRate.sunday), public_holiday: Number(payRate.public_holiday)} as PayRate, id: selectedPayRate?.id};
        
        try{
          setModalLoading(true);
          const res = await updatePayRate(updatedPayRate);
          if (res){
            payRates.length>0 && setPayRates(prev=>prev.map(pr=>pr.id===selectedPayRate.id?updatedPayRate:pr));
            displayToast("Successfully updated pay rate details!", 'success');
            setOpenModal(false);
          }
          else 
            displayToast("Fail to update pay rate details!", 'error');
        }
        finally{
          setModalLoading(false);
        }
        
      }
      else if (modalType === 'create'){
        const newPayRate : PayRate = {...{...payRate, weekday: Number(payRate.weekday), saturday: Number(payRate.saturday), sunday: Number(payRate.sunday), public_holiday: Number(payRate.public_holiday)} as PayRate};
        
        try{
          setModalLoading(true);
          const res = await insertPayRate(newPayRate);
          if (res){
            payRates.length>0 && setPayRates(prev=>[...prev, {...newPayRate, id: res}]);
            displayToast("Successfully added new pay rate details!", 'success');
            setOpenModal(false);
          }
          else 
            displayToast("Fail to add new pay rate details!", 'error');
        }
        finally{
          setModalLoading(false);
        }
      }
      else if (modalType==='delete' && selectedPayRate){
        try{
          setModalLoading(true);
          const res = await deletePayRate(selectedPayRate.id);
          if (res){
              payRates.length>0 && setPayRates(prev=>prev.filter(pr=>pr.id!==selectedPayRate.id));
              displayToast("Successfully deleted a job position/pay rate!", 'success');
              setOpenModal(false);
              setSelectedPayRate(null);
            }
            else 
              displayToast("Fail to delete pay rate!", 'error');
        }
        finally{
          setModalLoading(false);
        }
        
      }
    })();
  }

  const processUser = (user?:any) => {
    (async ()=>{
      if (modalType==='update' && selectedUser){
        const updatedUser : User = {...user as User, id: selectedUser?.id, role: selectedUser.role};
        
        try{
          setModalLoading(true);
          const res = await updateUser(updatedUser);
          if (res){
            users.length>0 && setUsers(prev=>prev.map(u=>u.id===selectedUser.id?updatedUser:u));
            displayToast("Successfully updated user details!", 'success');
            setOpenModal(false);
          }
          else 
            displayToast("Fail to update user details!", 'error');
        }
        finally{
          setModalLoading(false);
        }
        
      }
      else if (modalType === 'create'){
        let payRateId;

        if (showAssignPositionField && payRates){
          if (!selectedPayRate?.job_title || !selectedPayRate.age_group || !selectedPayRate.level){
            displayToast("Please select all the required fields for assigning pay rates", 'error');
            return;
          }

          payRateId = payRates.find(pr=>pr.job_title===selectedPayRate?.job_title && pr.age_group === selectedPayRate.age_group && pr.level.toString() === selectedPayRate.level.toString() && pr.specialty === ((selectedPayRate.specialty&&selectedPayRate.specialty!=='-')?selectedPayRate.specialty:null))?.id;
        }
        const newUser : User = {...user as User, role: newUserAdmin?'admin':'user', pay_rate_id: payRateId};

        try{
          setModalLoading(true);
          const res = await addNewUser(newUser, showOptionalFields, showAssignPositionField);
          if (res.success){
            users.length>0 && setUsers(prev=>[...prev, {...newUser, id: res.new_id, date_of_birth: sqlDateFormatToRegularFormat(newUser.date_of_birth??'').replaceAll('-','/')}]);
            displayToast(`Successfully added new ${newUserAdmin?'admin':'staff'} account!`, 'success');
            setOpenModal(false);
          }
          else {
            displayToast(res.err??"Fail to add new user account!", 'error');
          }
        }
        finally{
          setModalLoading(false);
        }
      }
      else if (modalType==='delete' && selectedUser){
        try{
          setModalLoading(true);
          const res = await deleteUser(selectedUser.email);
          if (res){
              users.length>0 && setUsers(prev=>prev.filter(u=>u.id!==selectedUser.id));
              displayToast("Successfully deleted a user account!", 'success');
              setOpenModal(false);
              setUserSelected(null);
            }
            else 
              displayToast("Fail to delete a user account!", 'error');
        }
        finally{
          setModalLoading(false);
        }
        
      }
    })();
  }
  const isOverMd=useIsOverMd();
  const stringIsFloat = (e:string) => /^[+-]?\d+(\.\d+)?$/.test(e);
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
        
      {activePage === 'pay-rates' ? <div className="mt-4 mb-2 text-gray-700">{isOverMd?'Hover over':'Click the'} the job title to see all assigned employees with that job title</div> : ''}

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
      <>
        <div className="flex-1 overflow-y-auto">
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
      
        <Button onClick={exportToCSV} className="mt-4 px-4 py-2 text-white rounded w-fit">
          Export CSV
        </Button>
      </>

      }
      

      { modalContainer.current && 
        <Modal details={{}} shown={openModal} setShown={setOpenModal} modalContainer={modalContainer.current} onClose={()=>setEditingPayRate(false)} setParentOpen={setOpenModal} displayToast={displayToast} title={modalType==="delete"?'Delete '+ activePage.substring(0,activePage.length-1) +' confirmation':modalType==="create"?'Create new '+activePage.substring(0,activePage.length-1) :modalType==='update'?"Modify "+ activePage.substring(0,activePage.length-1) +" details":'Manage pay rates'}>
          

          {selectedPayRate && modalType === 'delete' && activePage === 'pay-rates' &&
          <div>
          <p className="mb-6">
              Are you sure you want to delete <span className="font-medium text-secondary"><br/>{selectedPayRate.job_title}-{selectedPayRate.age_group}-{'Level ' + selectedPayRate.level}{selectedPayRate.specialty?'-'+selectedPayRate.specialty:''}?</span><br/><br/>Deleting this position will remove it from all assigned users. Those users will no longer have a position and must be reassigned to a new one.
            </p>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setOpenModal(false)}>No</Button>
              <Button type='outline' onClick={()=>processPayRate()}>Yes
              </Button>
            </div>
          </div>
          }

          {selectedUser && modalType === 'view' && 

          ((selectedUser?.pay_rate_id || editingPayRate) ? 
          (modalLoading ? <div className="m-10 flex relative">&nbsp;<Spinner/></div> : 
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
                    <Button className="w-fit mt-5 py-2 px-4" fontSize="0.9em" onClick={handleUpdateUsersPayRate}>Save</Button> : ''
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
            No job position/pay rates has been assigned to this user.


            <Button className="float-end mb-5 mt-5 py-2 px-4" fontSize="0.9em" onClick={()=>setEditingPayRate(true)}>Assign position</Button>
          </>)
          }

          {(modalType === 'update' || modalType === 'create') && activePage==='pay-rates' && 
          (modalLoading ? <div className="m-10 flex relative">&nbsp;<Spinner/></div> : 
          <Form onSubmit={async (_e, f)=> processPayRate(f)}>
            <div className="text-md flex flex-col gap-2 mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-primary font-semibold w-24 text-right">Job title: </span>
                  <Input name='job_title' className="min-w-40"  value={(selectedPayRate && modalType === 'update') ? selectedPayRate.job_title : undefined} onChange={(e)=>{selectedPayRate ? setSelectedPayRate({...selectedPayRate, job_title: e.target.value}):undefined}} placeholder="Enter the job title" required validateMode="onBlur"/>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-semibold w-24 text-right">Age Group: </span>
                  <Input name='age_group' className="min-w-40" value={(selectedPayRate && modalType === 'update') ? selectedPayRate.age_group : undefined} onChange={(e)=>selectedPayRate&&setSelectedPayRate({...selectedPayRate, age_group: e.target.value})} placeholder="Enter the age group" required validateMode="onBlur"/>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-semibold w-24 text-right">Level: </span>
                  <Input name='level' className="min-w-40"  value={(selectedPayRate && modalType === 'update' &&  selectedPayRate.level) ? selectedPayRate.level.toString() : undefined} onChange={(e)=>selectedPayRate&&setSelectedPayRate({...selectedPayRate, level: e.target.value, specialty: ''})} placeholder="Enter the level" required validateMode="onBlur"/>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-primary font-semibold w-24 text-right">Specialty: </span>
                  <Tooltip content='Leave empty if not specified' timeoutHide={2000} timeoutShow={500} position="bottom">
                    <Input name='specialty' className="min-w-40" value={(selectedPayRate && modalType === 'update' && selectedPayRate.specialty) ? selectedPayRate.specialty : undefined} placeholder="Enter optional specialty field" onChange={(e)=>selectedPayRate&&setSelectedPayRate({...selectedPayRate, specialty: e.target.value})}/>
                  </Tooltip>
                  
                </div>

                <span className="font-semibold text-primary w-24 text-right">Pay rate:</span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 w-fit ml-7">
                  
                  <div>
                    <span className="text-sm font-semibold text-primary">Weekday</span>
                    <Input name='weekday' className="w-fit md:w-40" placeholder="Enter weekday pay rate" type="icon left filled" icon="$" value={(selectedPayRate && modalType === 'update' && selectedPayRate.weekday) ? selectedPayRate.weekday.toPrecision(4) : ''} required validateMode="onChange" customValidate={(val:string)=>{
                    if (val==='') return'';
                    if (!stringIsFloat(val)) return 'Please type in this format XX.XX';
                    return '';
                  }}/>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-primary">Saturday</span>
                    <Input name='saturday' className="w-fit md:w-40" placeholder="Enter saturday pay rate" type="icon left filled" icon="$" value={(selectedPayRate && modalType === 'update' &&selectedPayRate.saturday) ? selectedPayRate.saturday.toPrecision(4) : ''} required validateMode="onChange" customValidate={(val:string)=>{
                    if (val==='') return'';
                    if (!stringIsFloat(val)) return 'Please type in this format XX.XX';
                    return '';
                  }}/>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-primary">Sunday</span>
                    <Input name='sunday' className="w-fit md:w-40" placeholder="Enter sunday pay rate" type="icon left filled" icon="$" value={(selectedPayRate && modalType === 'update' &&selectedPayRate.sunday) ? selectedPayRate.sunday.toPrecision(4) : ''} required validateMode="onChange" customValidate={(val:string)=>{
                    if (val==='') return'';
                    if (!stringIsFloat(val)) return 'Please type in this format XX.XX';
                    return '';
                  }}/>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-primary">Public Holiday</span>
                    <Tooltip content="Defaults to sunday's pay rate" timeoutShow={1500} timeoutHide={2000} position="bottom">
                    <Input name='public_holiday' className="w-fit md:w-40" placeholder="Enter public holiday pay rate (optional, defaults to sunday's pay rate)" type="icon left filled" icon="$" value={(selectedPayRate && modalType === 'update' && selectedPayRate.public_holiday) ? selectedPayRate.public_holiday.toPrecision(4) : ''} validateMode="onChange" customValidate={(val:string)=>{
                    if (val==='') return'';
                    if (!stringIsFloat(val)) return 'Please type in this format XX.XX';
                    return '';
                  }}/></Tooltip>
                  </div>
                </div>   


                <div className="flex flex-row-reverse items-end justify-between">
                  <Button className="w-fit mt-5 py-2 px-4" fontSize="0.9em" onClick={()=>activePage==='pay-rates'? setOpenModal(false): setEditingPayRate(false)}>Cancel</Button>
                  {
                    selectedPayRate && selectedPayRate.level && selectedPayRate.age_group && selectedPayRate.job_title ?
                    <Button className="w-fit mt-5 py-2 px-4" fontSize="0.9em" onClick={activePage==='pay-rates'?undefined:handleUpdateUsersPayRate} htmlType="submit">{modalType==='create'?'Add':'Save'}</Button> : ''
                  }
                </div>
            </div>
          </Form>)
          
          }



          {activePage==='users' && (modalType === 'create'|| modalType==='update') && 
               
              <Form onSubmit={async (_e,f)=>processUser(f)} >
                {modalLoading ? <div className="absolute rounded-lg top-0 left-0 w-full h-full z-10 bg-[#ffffffa2]"> <Spinner/> </div> : ''}
                <div className="flex flex-col gap-3 max-h-90 overflow-y-auto pr-2">
                  <h2 className="text-primary font-semibold">General account details</h2>
                  <div className="bg-gray-50 p-4 rounded-md -mt-2 ease-in-out duration-400">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="First Name" name="first_name" type="text" placeholder="First name"
                            value={(selectedUser&&modalType==='update'&&selectedUser.first_name) ? selectedUser.first_name : ''} required/>
                      <Input label="Last Name"  name="last_name"  type="text" placeholder="Last name"
                            value={(selectedUser&&modalType==='update'&&selectedUser.last_name) ? selectedUser.last_name : ''}  required/>
                      <Input label="Email" name="email" type="email" placeholder="Email"
                            value={(selectedUser&&modalType==='update'&&selectedUser.email) ? selectedUser.email : ''} required/>
                      <Input label={modalType==='create'?"Temporary Password":"Password"} name="password" type="password" placeholder={modalType==='create'?"Temporary Password":"Password"} required
                            value={(selectedUser&&modalType==='update') ? '676767' : ''} />
                      
                    </div>
                  </div>

                  {modalType === 'create' ?  
                  <Checkbox checked={showOptionalFields} onChange={(e)=>setShowOptionalFields(e)} label='Show optional fields' className="text-sm"/> 
                  : ''}

                  

                  {(showOptionalFields||modalType==='update') ? 
                  <>
                    <h2 className="text-primary font-semibold">Other optional and contact details</h2>
                  <div className="bg-gray-50 p-4 rounded-md -mt-2 ease-in-out duration-400">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Preferred Name"  name="preferred_name" type="text" placeholder="Preferred name"
                            value={(selectedUser&&modalType==='update'&&selectedUser.preferred_name) ? selectedUser.preferred_name : ''} />
                      <Input label="Gender" name="gender" type="gender" placeholder="Type your gender here..."
                            value={(selectedUser&&modalType==='update'&&selectedUser.gender) ? selectedUser.gender : ''}  validateMode="onSubmit"/>
                        
                      <Input label="Date of birth" name="date_of_birth" type="date" placeholder="DD-MM-YYYY"
                            value={((selectedUser&&modalType==='update'&&selectedUser.date_of_birth) && selectedUser.date_of_birth ) ? formatToSqlDate(selectedUser.date_of_birth?.replaceAll('/','-')) : ''}/>

                      <Input label="Mobile Phone"  name="phone" type="tel" placeholder="04xx xxx xxx"
                            value={(selectedUser&&modalType==='update'&&selectedUser.phone) ? selectedUser.phone : ''}/>
                      <Input label="Address" name="address" type="text" placeholder="Address"
                            value={(selectedUser&&modalType==='update'&&selectedUser.address) ? selectedUser.address : ''} validateMode="onSubmit" />
                      <Input label="Emergency Contact Person" name="emergency_person" type="text" placeholder="Emergency contact person"
                            value={(selectedUser&&modalType==='update'&&selectedUser.emergency_person) ? selectedUser.emergency_person : ''} />
                      <Input label="Emergency Contact Number" name="emergency_contact" type="text" placeholder="Emergency contact number"
                      value={(selectedUser&&modalType==='update'&&selectedUser.emergency_contact) ? selectedUser.emergency_contact : ''} />
                    </div>
                  </div>
                  </>
                  : ''}

                  {modalType === 'create' ?  
                  <Checkbox checked={showAssignPositionField} onChange={(e)=>setShowAssignPositionField(e)} label='Assign a position' className="text-sm"/> 
                  : ''}

                  {(showAssignPositionField && modalType==='create') ? 
                  <div className="bg-gray-50 p-4 rounded-md text-sm flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium w-24 text-right">Job title: </span>
                      <Dropdown className="min-w-40" items={[...(new Set(payRates.map(data=>data.job_title)))]} initialSelectedItem={selectedPayRate ? selectedPayRate.job_title : undefined} onChange={(e)=>{selectedPayRate ? setSelectedPayRate({...selectedPayRate, job_title: e}) : setSelectedPayRate({id:'',job_title: e, age_group:'',level:0});
                      if (selectedPayRate && e!==selectedPayRate.job_title) setSelectedPayRate({id:'',job_title: e, age_group:'',level:0});
                      }} disableTyping placeholder="Select job title"/>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium w-24 text-right">Age Group: </span>
                      <Dropdown className="min-w-40" items={(selectedPayRate && selectedPayRate.job_title) ? [...(new Set((payRates.filter(data=>data.job_title === selectedPayRate.job_title)).map(payRate=>payRate.age_group)))] : undefined} initialSelectedItem={selectedPayRate ? selectedPayRate.age_group : undefined} disableTyping disabled={!selectedPayRate || !selectedPayRate.job_title} syncCurrentWithInitialSelected={true} openWhenNoItemIsSelected={false} onChange={(e)=>selectedPayRate&&setSelectedPayRate({...selectedPayRate, level: 0, age_group: e})} placeholder="Select age group"/>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium w-24 text-right">Level: </span>
                      <Dropdown className="min-w-40" items={(selectedPayRate && selectedPayRate.age_group && selectedPayRate.job_title) ? [...(new Set((payRates.filter(data=>data.job_title === selectedPayRate.job_title && data.age_group === selectedPayRate.age_group)).map(payRate=>payRate.level.toString())))] : undefined} initialSelectedItem={(selectedPayRate &&  selectedPayRate.level) ? selectedPayRate.level.toString() : undefined} syncCurrentWithInitialSelected={true} openWhenNoItemIsSelected={false} disableTyping disabled={!selectedPayRate || !selectedPayRate.age_group} onChange={(e)=>selectedPayRate&&setSelectedPayRate({...selectedPayRate, level: e, specialty: ''})} placeholder="Select level"/>
                    </div>

                    {(specialtyList?.length === 1 && specialtyList[0] === '-') || !specialtyList ? '' :
                    <div className="flex items-center gap-2">
                      <span className="font-medium w-24 text-right">Specialty: </span>
                      
                      <Dropdown className="min-w-40" items={specialtyList} initialSelectedItem={(selectedPayRate && selectedPayRate.specialty) ? selectedPayRate.specialty : undefined} syncCurrentWithInitialSelected={true} openWhenNoItemIsSelected={false} disableTyping disabled={!selectedPayRate || !selectedPayRate.level} placeholder="Select optional specialty" onChange={(e)=>selectedPayRate&&setSelectedPayRate({...selectedPayRate, specialty:e})}/>
                      
                      
                    </div>}
                  </div>
                  :''}

                  <Checkbox checked={modalType==='update' ? selectedUser?.role ==='admin' : newUserAdmin} onChange={(e)=>(modalType==='update'&&selectedUser) ? setUserSelected({...selectedUser, role: e?'admin':'user'}) :setNewUserAdmin(e)} label='Set as administrator' className="text-sm"/> 

                  
                
                </div>
                
                

                <div className="flex items-stretch gap-3 justify-end">
                  <Button type="outline" className="text-sm px-4 py-2" fontSize='0.9em' onClick={()=>setOpenModal(false)}>
                    Cancel
                  </Button>
                  <Button htmlType="submit" className="text-sm px-6 py-2" fontSize='0.9em'>{modalType==='create'?'Add':'Save'}</Button>
                </div>
              </Form>
          }

          {selectedUser && modalType === 'delete'  && activePage === 'users' &&
            (modalLoading ? <div className="m-10 flex relative">&nbsp;<Spinner/></div> :<div>
            <p className="mb-6">
                Are you sure you want to delete <span className="font-medium text-secondary">{selectedUser.first_name} {selectedUser.last_name}</span> ({selectedUser.email})? <br/><br/>

                This will convert all shifts assigned to this user to be unassigned. Are you sure you want to continue?
              </p>
              <div className="flex justify-end gap-2">
                <Button onClick={() => setOpenModal(false)}>No</Button>
                <Button type='outline'
                  onClick={() => processUser()}
                >
                  Yes
                </Button>
              </div>
            </div>)
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