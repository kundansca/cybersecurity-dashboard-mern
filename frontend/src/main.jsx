import { App as AntdApp, ConfigProvider } from "antd";
import enUS from "antd/locale/en_US";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ConfigProvider locale={enUS} theme={{ token: { colorPrimary: "#1677ff", borderRadius: 6 } }}>
      <AntdApp>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  </StrictMode>
);
