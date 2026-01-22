import React, { useMemo } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Layout, Menu, theme, Typography, Avatar, Dropdown, Space, Breadcrumb } from "antd";
import { 
  DashboardOutlined, 
  TeamOutlined, 
  UserOutlined, 
  LogoutOutlined, 
  SettingOutlined,
  BellOutlined,
  FileTextOutlined
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

export function AppLayout() {
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG, colorPrimary },
  } = theme.useToken();

  const selectedKeys = useMemo(() => {
    if (location.pathname === "/questions" || location.pathname.startsWith("/questions/edit") || location.pathname === "/questions/create") return ["questions-list"];
    if (location.pathname === "/questions/categories") return ["questions-categories"];
    if (location.pathname === "/questions/hot-config") return ["questions-hot-config"];
    if (location.pathname.startsWith("/users")) return ["users"];
    return ["dashboard"];
  }, [location.pathname]);

  const openKeys = useMemo(() => {
    if (location.pathname.startsWith("/questions")) return ["questions"];
    return [];
  }, [location.pathname]);

  const breadcrumbItems = useMemo(() => {
    const items = [{ title: '首页' }];
    if (location.pathname.startsWith("/dashboard")) items.push({ title: '仪表盘' });
    if (location.pathname.startsWith("/users")) items.push({ title: '用户管理' });
    if (location.pathname.startsWith("/questions")) {
      items.push({ title: '题库管理' });
      if (location.pathname === "/questions/categories") items.push({ title: '分类管理' });
      else if (location.pathname === "/questions/hot-config") items.push({ title: '热门配置' });
      else if (location.pathname === "/questions/create") items.push({ title: '录入题目' });
      else if (location.pathname.startsWith("/questions/edit")) items.push({ title: '编辑题目' });
      else items.push({ title: '题目列表' });
    }
    return items;
  }, [location.pathname]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider 
        breakpoint="lg" 
        collapsedWidth="0"
        width={240}
        theme="light"
        style={{
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
          zIndex: 10
        }}
      >
        <div style={{ 
          height: 64, // 与 Header 高度一致
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: 0, // 移除外边距
          borderBottom: '1px solid rgba(5, 5, 5, 0.06)', // 添加底部分割线
        }}>
          <div style={{
            width: 32,
            height: 32,
            background: 'linear-gradient(135deg, #00B96B 0%, #1677FF 100%)', 
            borderRadius: 8,
            marginRight: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: 20,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>G</div>
          <Typography.Title level={4} style={{ margin: 0, letterSpacing: 0.5, fontSize: 18, fontWeight: 700 }}>
            GreatFed<span style={{ color: '#1677FF' }}>Camp</span>
          </Typography.Title>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={openKeys}
          style={{ borderRight: 0, padding: '0 8px' }}
          items={[
                    {
                      key: "dashboard",
                      icon: <DashboardOutlined />,
                      label: <Link to="/dashboard">仪表盘</Link>,
                    },
                    {
                      key: "users",
                      icon: <TeamOutlined />,
                      label: <Link to="/users">用户管理</Link>,
                    },
                    {
                      key: "questions",
                      icon: <FileTextOutlined />,
                      label: "题库管理",
                      children: [
                        { key: "questions-list", label: <Link to="/questions">题目列表</Link> },
                        { key: "questions-categories", label: <Link to="/questions/categories">分类管理</Link> },
                        { key: "questions-hot-config", label: <Link to="/questions/hot-config">热门配置</Link> },
                      ]
                    }
                  ]}
                />
      </Sider>
      <Layout style={{ background: '#f0f2f5' }}>
        <Header style={{ 
          padding: '0 24px', 
          background: colorBgContainer, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          zIndex: 9
        }}>
          <Breadcrumb items={breadcrumbItems} />
          
          <Space size="large">
            <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
            <Dropdown 
              menu={{ 
                items: [
                  { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
                  { type: 'divider' },
                  { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
                ] 
              }}
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar 
                  style={{ 
                    backgroundColor: '#1677FF', // 回归纯净的科技蓝
                    verticalAlign: 'middle',
                    boxShadow: '0 2px 4px rgba(22, 119, 255, 0.2)'
                  }} 
                  icon={<UserOutlined />} 
                />
                <Typography.Text strong>Admin User</Typography.Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: '24px 24px 0', minHeight: 280 }}>
          <Outlet />
        </Content>
        <Layout.Footer style={{ textAlign: 'center', color: '#888' }}>
          GreatFedCamp ©{new Date().getFullYear()} Created by Trae AI
        </Layout.Footer>
      </Layout>
    </Layout>
  );
}

