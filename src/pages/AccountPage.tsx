import { PageProps } from "../App";
import Layout from "../components/Layout";
import Sidebar from "../components/Sidebar";

const AccountPage = ({modalContainer}:PageProps) => {
  return (
    <Layout modalContainer={modalContainer}>

        <div className="flex min-h-screen bg-gray-100">
        
            <main className="flex-1 p-6 md:p-10">
              <h1 className="text-3xl font-bold mb-6 text-blue-900">Account Settings</h1>
              <div className="bg-white p-6 rounded shadow">
                <p className="text-gray-700">This is a placeholder for user account information and settings.</p>
                {/* Future: profile form, change password, etc. */}
              </div>
            </main>
          </div>
    </Layout>
    
  );
};

export default AccountPage;
