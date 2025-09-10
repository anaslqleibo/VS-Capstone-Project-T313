"use client";
import { useState, useRef, useEffect } from "react";
import Layout from "@/app/components/Layout";
import Form from "@/app/components/Form";
import Input from "@/app/components/Input";
import Button, { Toggle } from "@/app/components/Button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import Spinner from "@/app/components/Spinner";
import { updateUser, User } from "@/app/controllers/User";
import Toast from "@/app/components/Toast";

const AccountPage = () => {
  const modalContainer = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const user = useAuth().user;
  const[initialProfile, setInitialProfile] = useState({
    firstName: '',
    lastName:'',
    email: '',
    phone: '',
  });

  useEffect(()=>{
    if (user){
      setInitialProfile({
        firstName: user?.first_name,
        lastName: user?.last_name,
        email: user?.email,
        phone: user?.phone ?? "",
      });
      setProfile({
        firstName: user?.first_name,
        lastName: user?.last_name,
        email: user?.email,
        phone: user?.phone ?? "",
      });;
    }
  }, [user])

  const [profile, setProfile] = useState(initialProfile);

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

    if (initialProfile === profile){
      setIsEditing(false);
      return;
    }

    const updatedUser: User = {
      id: user?.id ?? 0,
      first_name: profile.firstName !== initialProfile.firstName ? profile.firstName : '',
      last_name: profile.lastName !== initialProfile.lastName ? profile.lastName : '',
      email: profile.email !== initialProfile.email ? profile.email : '',
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
      <div className="flex min-h-screen bg-gray-100">
        <Toast message={message} type={toastType} shown={showToast} setShown={setToastShown}/>
        
        <main className="flex-1 p-6 md:p-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-blue-900 ">Account</h1>

            {user?.role === 'admin' && <Button onClick={() => router.push("/user-management")} className="px-6 py-4">User Management</Button>}
            
          </div>

          {/* CARD */}
          {!user ? <Spinner /> :
            <div className="bg-white p-6 rounded-xl shadow">
            {/* VIEW MODE */}
            {!isEditing && (
              <div className="flex flex-col gap-6">
                <h2 className="text-xl font-semibold text-center">Profile</h2>

                {/* key/value grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <div className="text-xs text-gray-500">First Name</div>
                    <div className="font-medium">{profile.firstName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Last Name</div>
                    <div className="font-medium">{profile.lastName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="font-medium">{profile.email}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Phone Number</div>
                    <div className="font-medium">{profile.phone}</div>
                  </div>
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
                  <Input label="First Name" name="firstName" type="text" placeholder="First name"
                         value={profile.firstName} onChange={handleChange} />
                  <Input label="Last Name"  name="lastName"  type="text" placeholder="Last name"
                         value={profile.lastName}  onChange={handleChange} />
                  <Input label="Email" name="email" type="email" placeholder="email@company.com"
                         value={profile.email} onChange={handleChange} validateMode="onSubmit" />
                  <Input label="Phone Number" name="phone" type="tel" placeholder="04xx xxx xxx"
                         value={profile.phone} onChange={handleChange} />
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
