"use client";
import { useState, useRef, useEffect } from "react";
import Layout from "@/app/components/Layout";
import Form from "@/app/components/Form";
import Input from "@/app/components/Input";
import Button, { Toggle } from "@/app/components/Button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import Spinner from "@/app/components/Spinner";
import { fetchAccount, fetchPayRates, PayRate, updatePassword, updateUser, User } from "@/app/controllers/User";
import Toast from "@/app/components/Toast";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers";
import { formatToSqlDate } from "@/app/components/utils/formatDate";
import Modal from "@/app/components/Modal";
import { FaCheck } from "react-icons/fa";

const AccountPage = () => {
  const modalContainer = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const user = useAuth().user;
  const [initialProfile, setInitialProfile] = useState<Partial<User>>({});
  const [profile, setProfile] = useState<Partial<User>|undefined>(undefined);
  const [payRate, setPayRate] = useState<PayRate[]>([]);

  useEffect(()=>{
    const fetchAccountDetails = async () => {
      if (user){
        const completeUser = await fetchAccount(user.id.toString());
        setInitialProfile(completeUser);
        setProfile(completeUser);

        if (completeUser.pay_rate_id){
          try{
            setPayRateLoading(true);
            const payRate = await fetchPayRates(completeUser.pay_rate_id);
            setPayRate(payRate);
          }
          finally{
            setPayRateLoading(false);
          }
          
        }
        
      }
    }
    fetchAccountDetails();  
    
  }, [user])

  

  // Retrieve from db
  const initialSettings = {
    emailNotifications: true,
    smsAlerts: false,
    shiftReminders: true,
    showPhoneToSupervisors: true,
  };

  const [settings, setSettings] = useState(initialSettings);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payRateLoading, setPayRateLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!profile || !initialProfile || initialProfile === profile ){
      setIsEditing(false);
      return;
    }

    const updatedUser: User = {
      id: user?.id ?? 0,
      first_name: profile.first_name !== initialProfile.first_name && profile.first_name ? profile.first_name : '',
      last_name: profile.last_name !== initialProfile.last_name && profile.last_name ? profile.last_name : '',
      email: profile.email !== initialProfile.email && profile.email ? profile.email : '',
      phone: profile.phone !== initialProfile.phone ? profile.phone : '',
      role: user?.role ?? 'user',
      preferred_name: profile.preferred_name !== initialProfile.preferred_name ? profile.preferred_name : '',
      gender: profile.gender !== initialProfile.gender ? profile.gender : '',
      date_of_birth: profile.date_of_birth !== initialProfile.date_of_birth ? formatToSqlDate(profile.date_of_birth??''): '',
      address: profile.address !== initialProfile.address ? profile.address : '',
      emergency_person: profile.emergency_person !== initialProfile.emergency_person ? profile.emergency_person : '',
      emergency_contact: profile.emergency_contact !== initialProfile.emergency_contact ? profile.emergency_contact : '',
    }
  
    try{
      setLoading(true);
      const res = await updateUser(updatedUser);
      if (res){
        setProfile({...profile, date_of_birth: profile.date_of_birth?.replaceAll('-','/')??''});
        setInitialProfile({...profile, date_of_birth: profile.date_of_birth?.replaceAll('-','/')??''});
        displayToast("Succesfully updated user profile!", 'success');
        setIsEditing(false);
      }
      else{
        displayToast("Failed to update user profile!", 'error');
      }
    }
    finally{
      setLoading(false);
    }
    
  };

  const handleCancel = () => {
    setSettings(initialSettings);
    setProfile(initialProfile);
  }

  const [openModal, setOpenModal] = useState(false);
  const [showToast, setToastShown] = useState(false);
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState<"success"|"error">("success");

  const displayToast = (message: string, toastType: "success"|"error") => {
      setMessage(message);
      setToastType(toastType);
      setToastShown(true);
  }

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const handleUpdatePassword = async () => {
    if (!user?.id) return;
    
    try{
      if (user?.id){
        setOpenModal(false);
        setLoading(true);
        const res = await updatePassword(user?.id.toString(), newPassword);
        if (res){
          setNewPassword('');
          setConfirmPassword('');
          displayToast("Successfully changed your password!", 'success');
        }
        else displayToast("Fail to change your password!", 'error');
      }
    }
    finally{
      setLoading(false);
    }
  }

  return (
    <Layout modalContainer={modalContainer}>
      <div className="flex h-full bg-gray-100">
        <Toast message={message} type={toastType} shown={showToast} setShown={setToastShown}/>
        
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <h1 className="text-3xl font-bold text-blue-900 mb-4">Account</h1>


          {/* CARD */}
          {profile === undefined || loading ? <Spinner custom showWater backgroundGradient borderSpinner/> :
            <div className="bg-white p-6 rounded-xl shadow">
            {/* VIEW MODE */}
            {!isEditing && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <h2 className="text-xl font-semibold">Personal Details</h2>
                  {profile && (!profile.gender || !profile.date_of_birth) && 
                  <p className="text-sm text-danger">Please complete your personal details</p>}
                </div>

                {/* key/value grid */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-16 bg-gray-100 p-4 rounded-md -mt-2 ease-in-out duration-400 hover:bg-[color:#dce6fc]">
                  <div>
                    <div className="text-xs text-gray-500">Name</div>
                    <div className="font-medium">{profile&&profile.first_name&& profile.last_name&& (profile.first_name + ' ' + profile.last_name)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Preferred Name</div>
                    <div className="font-medium">{profile && (profile.preferred_name ?? "-")}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Gender</div>
                    <div className="font-medium">{profile && (profile.gender ?? "-")}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Date of birth</div>
                    <div className="font-medium">{(profile && profile.date_of_birth && (profile.date_of_birth + ` (${dayjs().year()-Number(profile.date_of_birth?.split('/')[2])} years old)`)) ?? "-"}</div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <h2 className="text-xl font-semibold">Contact</h2>
                  {profile && (!profile.phone || !profile.address || !profile.emergency_person || !profile.emergency_contact) && 
                  <p className="text-sm text-danger">Please complete your contact details</p>}
                </div>
                
                

                {/* key/value grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 bg-gray-100 p-4 rounded-md -mt-2 ease-in-out duration-400 hover:bg-[color:#dce6fc]">
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="font-medium">{profile.email}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Mobile</div>
                    <div className="font-medium">{profile.phone ?? "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Address</div>
                    <div className="font-medium">{profile.address ?? "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Emergency contact</div>
                    <div className="font-medium">{profile.emergency_person ?? "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Contact details</div>
                    <div className="font-medium">{profile.emergency_contact ?? "-"}</div>
                  </div>
                </div>

                <h2 className="text-xl font-semibold">Pay Details</h2>
                {payRate && 
                <div className="grid grid-cols-2 md:flex md:gap-8 -mt-4">
                  <h5 className="font-semibold text-sm">
                    <span className="text-xs text-gray-500">Active job title: </span> 
                    <div>{(payRate[0] && 'job_title' in payRate[0]) ? payRate[0].job_title : "-"}</div>
                  </h5>

                  <h5 className="font-semibold text-sm">
                    <span className="text-xs text-gray-500">Age group:</span> 
                    <div>{(payRate[0] && 'age_group' in payRate[0]) ? payRate[0].age_group : "-"}</div>
                  </h5>

                  <h5 className="font-semibold text-sm">
                    <span className="text-xs text-gray-500">Level:</span> 
                    <div>{(payRate[0] && 'level' in payRate[0]) ? payRate[0].level : "-"}</div>
                  </h5>

                  {(payRate[0] && payRate[0].specialty) ? 
                  <h5 className="font-semibold text-sm">
                    <span className="text-xs text-gray-500">Specialty: </span>
                    <div>{payRate[0].specialty}</div>
                  </h5> : ""}
                  


                </div>
                  
                  }

                {/* key/value grid */}
                {payRateLoading ? <Spinner/> :
                <div className="grid grid-cols-2 md:flex md:flex-row gap-4 md:gap-16 bg-gray-100 p-4 rounded-md -mt-4 ease-in-out duration-400 hover:bg-[color:#dce6fc]">
                  
                  {payRate.length>0 ? payRate.map((rate, index) => (
                    <div key={index}>
                      <div className="text-xs text-gray-500">{rate.day_type}</div>
                      <div className="font-medium">${(rate.amount?.toPrecision(4))}</div>
                    </div>
                  )): "Your pay rates has not been setup by the admin."}
                </div>}
                

                {/* Settings summary */}
                <div>
                  <h3 className="text-lg font-semibold mt-2 mb-3">Settings</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-4">
                    <li className="flex items-center justify-between border-2 rounded-lg px-3 py-2">
                      <span>Email notifications</span>
                      <span className={`text-sm font-bold ${settings.emailNotifications ? "text-green-600" : "text-gray-500"}`}>
                        {settings.emailNotifications ? "ON" : "OFF"}
                      </span>
                    </li>
                    <li className="flex items-center justify-between border-2 rounded-lg px-3 py-2">
                      <span>SMS alerts</span>
                      <span className={`text-sm font-bold ${settings.smsAlerts ? "text-green-600" : "text-gray-500"}`}>
                        {settings.smsAlerts ? "ON" : "OFF"}
                      </span>
                    </li>
                    <li className="flex items-center justify-between border-2 rounded-lg px-3 py-2">
                      <span>Shift reminders</span>
                      <span className={`text-sm font-bold ${settings.shiftReminders ? "text-green-600" : "text-gray-500"}`}>
                        {settings.shiftReminders ? "ON" : "OFF"}
                      </span>
                    </li>
                    <li className="flex items-center justify-between border-2 rounded-lg px-3 py-2">
                      <span>Show phone to supervisors</span>
                      <span className={`text-sm font-bold ${settings.showPhoneToSupervisors ? "text-green-600" : "text-gray-500"}`}>
                        {settings.showPhoneToSupervisors ? "ON" : "OFF"}
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setIsEditing(true)} className="px-6 py-4">Edit profile & settings</Button>
                </div>
              </div>
            )}

            {/* EDIT MODE */}
            {isEditing && (
              <Form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <h2 className="text-xl font-semibold">Edit personal details</h2>
                <div className="bg-gray-100 p-4 rounded-md -mt-2 ease-in-out duration-400">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="First Name" name="first_name" type="text" placeholder="First name"
                          value={profile ? profile.first_name : ''} onChange={handleChange} required/>
                    <Input label="Last Name"  name="last_name"  type="text" placeholder="Last name"
                          value={profile ? profile.last_name : ''}  onChange={handleChange} required/>
                    <Input label="Preferred Name"  name="preferred_name" type="text" placeholder="Preferred name"
                          value={profile ? profile.preferred_name : ''}  onChange={handleChange} />
                    <Input label="Gender" name="gender" type="gender" placeholder="Type your gender here..."
                          value={profile ? profile.gender : ''} onChange={handleChange} validateMode="onSubmit" required/>
                      
                    <Input label="Date of birth" name="date_of_birth" type="date" placeholder="DD-MM-YYYY"
                          value={(profile && profile.date_of_birth ) ? formatToSqlDate(profile.date_of_birth?.replaceAll('/','-')) : ''} onChange={handleChange} required/>

                    <div className="flex items-end justify-end">
                      <Button onClick={()=>setOpenModal(true)} className="px-4 py-2 h-fit w-fit" fontSize="0.9em">Change password</Button>
                    </div>
                    
                  </div>
                </div>

                <h2 className="text-xl font-semibold">Edit contact details</h2>
                <div className="bg-gray-100 p-4 rounded-md -mt-2 ease-in-out duration-400">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="Email" name="email" type="email" placeholder="Email"
                          value={profile ? profile.email : ''} onChange={handleChange} />
                    <Input label="Mobile Phone"  name="phone" type="tel" placeholder="04xx xxx xxx"
                          value={profile ? profile.phone : ''}  onChange={handleChange} />
                    <Input label="Address" name="address" type="text" placeholder="Address"
                          value={profile ? profile.address : ''} onChange={handleChange} validateMode="onSubmit" />
                    <Input label="Emergency Contact Person" name="emergency_person" type="text" placeholder="Emergency contact person"
                          value={profile ? profile.emergency_person : ''} onChange={handleChange} />
                    <Input label="Emergency Contact Number" name="emergency_contact" type="text" placeholder="Emergency contact number"
                    value={profile ? profile.emergency_contact : ''} onChange={handleChange} />
                  </div>
                </div>
                

                <div>
                  <h3 className="text-lg font-semibold mt-2 mb-3">Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { key: "emailNotifications", label: "Email notifications" },
                      { key: "smsAlerts", label: "SMS alerts" },
                      { key: "shiftReminders", label: "Shift reminders" },
                      { key: "showPhoneToSupervisors", label: "Show phone to supervisors" },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center justify-between border rounded-lg px-3 py-2 cursor-pointer">
                        <span>{label}</span>
                        {/* <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={settings[key as keyof typeof settings]}
                          onChange={() => toggleSetting(key as keyof typeof settings)}
                        /> */}

                        <Toggle checked={settings[key as keyof typeof settings]}
                          onChange={() => toggleSetting(key as keyof typeof settings)} />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-stretch gap-3 justify-end">
                  <Button type="outline" onClick={() => {setIsEditing(false); handleCancel();}}>
                    Cancel
                  </Button>
                  <Button htmlType="submit">Save changes</Button>
                </div>
              </Form>
            )}
          </div>
          }
          
           { modalContainer.current && 
            <Modal details={{}} shown={openModal} setShown={setOpenModal} modalContainer={modalContainer.current} setParentOpen={setOpenModal} displayToast={displayToast} title="Change password">
              <Form onSubmit={(e)=>{handleUpdatePassword(); return''}}>
                <div className="mt-4 flex flex-col gap-4">
                  <Input label="New Password" type="password" required allowViewPassword placeholder="Enter your new password here..." minLength={8} maxLength={255} value={newPassword} onChange={(e)=>setNewPassword(e.target.value)}
                  customValidate={(val : string) => {
                    if (!/[a-z]/.test(val)) return "Password must contain at least one lowercase letter.";
                    if (!/[A-Z]/.test(val)) return "Password must contain at least one uppercase letter.";
                    if (!/[0-9]/.test(val)) return "Password must contain at least one digit.";
                    if (!/[!@#$%^&*()\-=_+\[\]{};':",.?/<>]/.test(val)) return "Password must contain at least one symbol.";
                    return '';
                    }
                    }/>
                  <Input label="Confirm Password" type="password" required allowViewPassword placeholder="Enter to confirm your password here..." value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} customValidate={(val:string) => val===newPassword ? '' : "Passwords do not match."} validateMode="onChange"/>
                </div>

                <div className="flex flex-col gap-1">
                  {newPassword.length >= 8 && <div className="flex items-center text-success gap-4 text-sm">
                     <FaCheck/>Password minimum length of 8 characters
                  </div>}
                  {(/[a-z]/.test(newPassword)) && <div className="flex items-center text-success gap-4 text-sm">
                    <FaCheck/>Password contain at least one lowercase letter
                  </div>}
                  {(/[A-Z]/.test(newPassword)) && <div className="flex items-center text-success gap-4 text-sm">
                    <FaCheck/>Password contain at least one uppercase letter
                  </div>}
                  {(/[0-9]/.test(newPassword)) && <div className="flex items-center text-success gap-4 text-sm">
                    <FaCheck/>Password contain at least one digit
                  </div>}
                  {(/[!@#$%^&*()\-=_+\[\]{};':",.?/<>]/.test(newPassword)) && <div className="flex items-center text-success gap-4 text-sm">
                    <FaCheck/>Password contain at least one symbol
                  </div>}
                </div>

                <div className="-mb-4 mt-4 flex justify-end">
                  <Button htmlType="submit" className="w-fit py-4 px-6" fontSize="0.8em">Update</Button>
                </div>
                
              </Form>
            </Modal>
            }
        </main>

        
      </div>
    </Layout>
  );
};

export default AccountPage;
