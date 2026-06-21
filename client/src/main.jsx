
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './components/context/ThemeContext.jsx'
import { AuthProvider } from './components/context/AuthContext.jsx'
import ReactDOM from "react-dom/client";
import {Toaster} from "react-hot-toast"


ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <AuthProvider>
      <Toaster/>
      <App />
    </AuthProvider>
  </ThemeProvider>

);
