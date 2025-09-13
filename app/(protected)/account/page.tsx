"use client";
import { useState, useRef, useEffect } from "react";
import Layout from "@/app/components/Layout";
import Form from "@/app/components/Form";
import Input from "@/app/components/Input";
import Button, { Toggle } from "@/app/components/Button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import Spinner from "@/app/components/Spinner";
import { fetchAccount, fetchPayRates, PayRate, updateUser, User } from "@/app/controllers/User";
import Toast from "@/app/components/Toast";
import dayjs from "dayjs";

const AccountPage = () => {
  const modalContainer = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const user = useAuth().user;
  const [initialProfile, setInitialProfile] = useState<Partial<User>>({});
  const [profile, setProfile] = useState<Partial<User>>({});
  const [payRate, setPayRate] = useState<PayRate[]>([]);

  useEffect(()=>{
    const fetchAccountDetails = async () => {
      if (user){
        const completeUser = await fetchAccount(user.id.toString());
        setInitialProfile(completeUser);
        setProfile(completeUser);

        if (completeUser.pay_rate_id){
          const payRate = await fetchPayRates(completeUser.pay_rate_id);
          setPayRate(payRate);
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
    }
    const res = await updateUser(updatedUser);
    if (res){
      displayToast("Succesfully updated user profile!", 'success');
      setIsEditing(false);
    }
    else{
      displayToast("Failed to update user profile!", 'error');
    }
  };

  const handleCancel = () => {
    setSettings(initialSettings);
    setProfile(initialProfile);
  }

  const [showToast, setToastShown] = useState(false);
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState<"success"|"error">("success");

  const displayToast = (message: string, toastType: "success"|"error") => {
      setMessage(message);
      setToastType(toastType);
      setToastShown(true);
  }

  return (
    <Layout modalContainer={modalContainer}>
      <div className="flex h-full bg-gray-100">
        <Toast message={message} type={toastType} shown={showToast} setShown={setToastShown}/>
        
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-blue-900 ">Account</h1>

            {user?.role === 'admin' && <Button onClick={() => router.push("/user-management")} className="px-6 py-4">User Management</Button>}
            
          </div>

          {/* CARD */}
          {!profile ? <Spinner /> :
            <div className="bg-white p-6 rounded-xl shadow">
            {/* VIEW MODE */}
            {!isEditing && (
              <div className="flex flex-col gap-6">
                <h2 className="text-xl font-semibold">Personal Details</h2>

                {/* key/value grid */}
                <div className="flex flex-col md:flex-row gap-16 bg-gray-100 p-4 rounded-md -mt-2 ease-in-out duration-400 hover:bg-[color:#dce6fc]">
                  <div>
                    <div className="text-xs text-gray-500">Name</div>
                    <div className="font-medium">{profile&&profile.first_name&& profile.last_name&& (profile.first_name + ' ' + profile.last_name)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Preferred Name</div>
                    <div className="font-medium">{profile && profile.preferred_name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Gender</div>
                    <div className="font-medium">{profile && profile.gender}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Date of birth</div>
                    <div className="font-medium">{profile && profile.date_of_birth && (profile.date_of_birth + ` (${dayjs().year()-Number(profile.date_of_birth?.split('/')[2])} years old)`)}</div>
                  </div>
                </div>

                <h2 className="text-xl font-semibold">Contact</h2>

                {/* key/value grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 bg-gray-100 p-4 rounded-md -mt-2 ease-in-out duration-400 hover:bg-[color:#dce6fc]">
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="font-medium">{profile.email}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Mobile</div>
                    <div className="font-medium">{profile.phone}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Address</div>
                    <div className="font-medium">{profile.address}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Emergency contact</div>
                    <div className="font-medium">{profile.emergency_person}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Contact details</div>
                    <div className="font-medium">{profile.emergency_contact}</div>
                  </div>
                </div>

                <h2 className="text-xl font-semibold">Pay Details</h2>
                {payRate && <h5 className="font-semibold text-sm -mt-4"><span className="text-xs text-gray-500">Active job title:</span> {(payRate[0] && 'job_title' in payRate[0]) ? payRate[0].job_title : "-"}</h5>}

                {/* key/value grid */}
                <div className="flex flex-col md:flex-row gap-16 bg-gray-100 p-4 rounded-md -mt-4 ease-in-out duration-400 hover:bg-[color:#dce6fc]">
                  
                  {payRate.length>0 ? payRate.map((rate, index) => (
                    <div key={index}>
                      <div className="text-xs text-gray-500">{rate.day_type}</div>
                      <div className="font-medium">${(rate.amount?.toPrecision(4))}</div>
                    </div>
                  )): "Your pay rates has not been setup by the admin."}
                </div>

                {/* Settings summary */}
                <div>
                  <h3 className="text-lg font-semibold mt-2 mb-3">Settings</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <li className="flex items-center justify-between border rounded-lg px-3 py-2">
                      <span>Email notifications</span>
                      <span className={`text-sm ${settings.emailNotifications ? "text-green-600" : "text-gray-500"}`}>
                        {settings.emailNotifications ? "On" : "Off"}
                      </span>
                    </li>
                    <li className="flex items-center justify-between border rounded-lg px-3 py-2">
                      <span>SMS alerts</span>
                      <span className={`text-sm ${settings.smsAlerts ? "text-green-600" : "text-gray-500"}`}>
                        {settings.smsAlerts ? "On" : "Off"}
                      </span>
                    </li>
                    <li className="flex items-center justify-between border rounded-lg px-3 py-2">
                      <span>Shift reminders</span>
                      <span className={`text-sm ${settings.shiftReminders ? "text-green-600" : "text-gray-500"}`}>
                        {settings.shiftReminders ? "On" : "Off"}
                      </span>
                    </li>
                    <li className="flex items-center justify-between border rounded-lg px-3 py-2">
                      <span>Show phone to supervisors</span>
                      <span className={`text-sm ${settings.showPhoneToSupervisors ? "text-green-600" : "text-gray-500"}`}>
                        {settings.showPhoneToSupervisors ? "On" : "Off"}
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
                <h2 className="text-xl font-semibold text-center">Edit Profile</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="First Name" name="first_name" type="text" placeholder="First name"
                         value={profile ? profile.first_name : undefined} onChange={handleChange} />
                  <Input label="Last Name"  name="last_name"  type="text" placeholder="Last name"
                         value={profile ? profile.last_name : undefined}  onChange={handleChange} />
                  <Input label="Email" name="email" type="email" placeholder="email@company.com"
                         value={profile ? profile.email : undefined} onChange={handleChange} validateMode="onSubmit" />
                  <Input label="Phone Number" name="phone" type="tel" placeholder="04xx xxx xxx"
                         value={profile ? profile.phone : undefined} onChange={handleChange} />
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
          
        </main>
      </div>
    </Layout>
  );
};

export default AccountPage;
