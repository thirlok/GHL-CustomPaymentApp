import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const buttons = [
    // { label: "HPS3 Testing", path: "/hps3" },
    { label: "GHL Auth", path: "/ghlauth" },
    { label: "GHL Page", path: "/ghlpage" },

    { label: "Custom Page Testing", path: "/custom-page" },
    { label: "Query Page", path: "/querypage" },
    { label: "Payment Page Testing", path: "/paymentpage" },
  ];

  return (
    <div className="">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
        {buttons.map((btn, index) => (
          <button
            key={index}
            onClick={() => navigate(btn.path)}
            className="px-6 py-3 rounded-2xl shadow-md bg-white 
                       text-indigo-600 font-semibold transition-all duration-300"
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Home;
