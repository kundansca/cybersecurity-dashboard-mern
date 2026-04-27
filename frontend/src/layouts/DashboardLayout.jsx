import {
  DashboardOutlined,
  SafetyOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Dropdown, Layout, Menu, Space, Typography } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: "/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "/vulnerabilities", icon: <SafetyOutlined />, label: "Vulnerabilities" },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const selected =
    location.pathname === "/" || location.pathname === "/dashboard"
      ? "/dashboard"
      : location.pathname;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth={0} width={220} theme="dark">
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Typography.Title level={5} style={{ color: "#fff", margin: 0 }}>
            KEV Monitor
          </Typography.Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selected]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Space size="middle">
            <Typography.Text type="secondary">CISA KEV</Typography.Text>
            <Dropdown
              menu={{
                items: [
                  { key: "p", label: "Profile" },
                  { key: "s", label: "Settings" },
                ],
              }}
              placement="bottomRight"
            >
              <Space style={{ cursor: "pointer" }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <SettingOutlined />
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: 24, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
