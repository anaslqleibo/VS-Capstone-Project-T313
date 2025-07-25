import Layout from "../components/Layout";

const MessagingPage = () => {
  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6 text-blue-900">Messaging</h1>
      <div className="bg-white rounded-lg shadow p-6 max-w-3xl">
        <p className="text-gray-600 mb-4">Send a message to your supervisor or admin:</p>
        <textarea
          placeholder="Type your message..."
          className="w-full border rounded-md p-3 mb-4 h-32 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
          Send Message
        </button>
      </div>
    </Layout>
  );
};

export default MessagingPage;
