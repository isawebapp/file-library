import axios from "axios";
import loadConfig from "./config";

const [PORT, setPort] = useState("");

useEffect(() => {
  loadConfig()
    .then((config) => {
      if (config && config.port) {
        setPort(config.port);
      } else {
        console.error("PORT not found in config.yml");
        setError("Server configuration is missing.");
      }
    })
    .catch((err) => {
      console.error("Error loading config:", err);
      setError("Failed to load server configuration.");
    });
}, []);

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  };
};

export const getCurrentUser = async () => {
  try {
    const response = await axios.get(`http://localhost:${PORT}/api/auth/me`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Auth error:", error.response?.data || error.message);
    return null;
  }
};

export const getProtectedData = async (endpoint) => {
  try {
    const response = await axios.get(`http://localhost:${PORT}${endpoint}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Protected API error:", error.response?.data || error.message);
    return null;
  }
};
