import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import GhlTestPage from "./ghlTestPage";
import CustomPage from "./Pages/customPage";
import HPS3 from "./Pages/HPS3/HPS3";
import Home from "./Home";
import CreatePayment from "./Pages/createPayment";
import QueryPage from "./iframseTest/QueryPage";
import GhlPage from "./iframseTest/GHLpage";
import Latpaypage from "./iframseTest/Latpaypage";
import GhlAuth from "./ghlAuth";

function App() {
  return (
    <div>
      <Router>
      
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ghlpage" element={<GhlPage />} />
          <Route path="/latpaypage" element={<Latpaypage/>}/>
          <Route path="/ghlauth" element={<GhlAuth />} />
          <Route path="/ghlconfig" element={<GhlTestPage />} />
          <Route path="/custom-page" element={<CustomPage />} />
          <Route path="/hps3" element={<HPS3 />} />
          <Route path="/createpayment" element={<CreatePayment />} />
          <Route path="/querypage" element={<QueryPage />} />
        </Routes>
    
      </Router>
    </div>
  );
}

export default App;
