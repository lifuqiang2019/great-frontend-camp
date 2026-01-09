import React, { useMemo } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Layout, Menu, theme, Typography } from "antd";
import { DashboardOutlined, TeamOutlined } from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

export function AppLayout() {
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const selectedKeys = useMemo(() => {
    if (location.pathname.startsWith("/users")) return ["users"];
    return ["dashboard"];
  }, [location.pathname]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ padding: 16 }}>
          <Typography.Title level={4} style={{ color: "#fff", margin: 0 }}>
            GreatFedCamp
          </Typography.Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={[
            {
              key: "dashboard",
              icon: <DashboardOutlined />,
              label: <Link to="/dashboard">仪表盘</Link>,
            },
            {
              key: "users",
              icon: <TeamOutlined />,
              label: <Link to="/users">用户</Link>,
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ paddingInline: 16, background: colorBgContainer }}>
          <Typography.Text>后台管理</Typography.Text>
        </Header>
        <Content style={{ margin: 16 }}>
          <div style={{ padding: 16, background: colorBgContainer, borderRadius: borderRadiusLG }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

