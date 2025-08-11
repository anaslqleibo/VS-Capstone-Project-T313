import { useState } from "react";
import { PageProps } from "../App";
import Layout from "../components/Layout";
import Form from "../components/Form";
import Input from "../components/Input";
import Button from "../components/Button";

const AccountPage = ({ modalContainer }: PageProps) => {
  const [profile, setProfile] = useState({
    firstName: "Test",
    lastName: "Testington",
    email: "Test@example.com",
    phone: "0123 456 789",
    role: "Casual Instructor",
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsAlerts: false,
    shiftReminders: true,
    showPhoneToSupervisors: true,
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // demo-only
    // TODO: persist to Firebase here
    setIsEditing(false);
  };

  return (
    <Layout modalContainer={modalContainer}>
      <div className="flex min-h-screen bg-gray-100">
        <main className="flex-1 p-6 md:p-10">
          <h1 className="text-3xl font-bold mb-6 text-blue-900">Account</h1>

          {/* CARD */}
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
                  <div>
                    <div className="text-xs text-gray-500">Role</div>
                    <div className="font-medium">{profile.role}</div>
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
                  <Button onClick={() => setIsEditing(true)} className="px-6">Edit profile & settings</Button>
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
                  <Input label="Role" name="role" type="text" placeholder="Role"
                         value={profile.role} onChange={handleChange} />
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
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={settings[key as keyof typeof settings]}
                          onChange={() => toggleSetting(key as keyof typeof settings)}
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-end">
                  <button
                    type="button"
                    className="px-5 py-2 rounded-md border hover:bg-gray-50"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                  <Button htmlType="submit" className="px-6">Save changes</Button>
                </div>
              </Form>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default AccountPage;
