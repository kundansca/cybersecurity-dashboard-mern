import {
  DashboardOutlined,
  MenuOutlined,
  SafetyOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Drawer, Dropdown, Grid, Layout, Menu, Space, Typography } from "antd";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: "/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "/vulnerabilities", icon: <SafetyOutlined />, label: "Vulnerabilities" },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const selected =
    location.pathname === "/" || location.pathname === "/dashboard"
      ? "/dashboard"
      : location.pathname;
  const onMenuClick = ({ key }) => {
    navigate(key);
    setMobileNavOpen(false);
  };
  const menuNode = (
    <Menu theme="dark" mode="inline" selectedKeys={[selected]} items={menuItems} onClick={onMenuClick} />
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {!isMobile && (
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
          {menuNode}
        </Sider>
      )}
      <Drawer
        title="KEV Monitor"
        placement="left"
        width={260}
        open={isMobile && mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        bodyStyle={{ padding: 0, background: "#001529" }}
        headerStyle={{ background: "#001529", color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {menuNode}
      </Drawer>
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: isMobile ? "0 12px" : "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Space size="middle">
            {isMobile ? (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation"
              />
            ) : null}
            <Typography.Text type="secondary">CISA KEV</Typography.Text>
          </Space>
          <Space size="middle">
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
        <Content style={{ margin: isMobile ? 12 : 24, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
