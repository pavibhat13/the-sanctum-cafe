import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Additional CSS for custom styles
document.head.insertAdjacentHTML("beforeend", `
  <style>
    /* Custom scrollbar */
    .scroll-container {
      scrollbar-width: thin;
    }
    .scroll-container::-webkit-scrollbar {
      width: 5px;
      height: 5px;
    }
    .scroll-container::-webkit-scrollbar-thumb {
      background: hsl(15, 25%, 40%);
      border-radius: 10px;
    }
    .scroll-container::-webkit-scrollbar-track {
      background: hsl(0, 0%, 90%);
      border-radius: 10px;
    }
    
    /* Font styles */
    h1, h2, h3, h4, h5, h6 {
      font-family: 'Poppins', sans-serif;
    }
    body {
      font-family: 'Open Sans', sans-serif;
    }
    
    /* Custom animation classes */
    .fade-in {
      animation: fadeIn 0.5s ease-in-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .slide-up {
      animation: slideUp 0.3s ease-out;
    }
    
    @keyframes slideUp {
      from { transform: translateY(10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  </style>
`);

createRoot(document.getElementById("root")!).render(<App />);
