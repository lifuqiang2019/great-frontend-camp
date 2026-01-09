import React, { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Typography, Spin, List, Avatar, Space, Tag, theme } from "antd";
import { UserOutlined, RiseOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import request from '../../lib/request';

interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  activeSessions: number;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    createdAt: string;
    image?: string;
  }>;
}

export function DashboardPage() {
  const {
    token: { colorPrimary },
  } = theme.useToken();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    newUsersToday: 0,
    activeSessions: 0,
    recentUsers: []
  });

  useEffect(() => {
    request.get<DashboardStats>('/users/stats')
      .then(data => {
        setStats(data);
      })
      .catch(err => {
        console.error('Failed to fetch stats:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: 0 }}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={8}>
              <Card bordered={false} hoverable>
                <Statistic 
                  title="总用户数" 
                  value={stats.totalUsers} 
                  prefix={<UserOutlined style={{ color: colorPrimary }} />} 
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card bordered={false} hoverable>
                <Statistic 
                  title="今日新增" 
                  value={stats.newUsersToday} 
                  prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: stats.newUsersToday > 0 ? '#52c41a' : undefined }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card bordered={false} hoverable>
                <Statistic 
                  title="活跃会话" 
                  value={stats.activeSessions} 
                  prefix={<SafetyCertificateOutlined style={{ color: '#faad14' }} />} 
                />
              </Card>
            </Col>
          </Row>

          <Card title="最新注册用户" bordered={false}>
            <List
              itemLayout="horizontal"
              dataSource={stats.recentUsers}
              renderItem={(user) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={user.image} icon={<UserOutlined />} style={{ backgroundColor: colorPrimary }} />}
                    title={<Typography.Text strong>{user.name || user.email.split('@')[0]}</Typography.Text>}
                    description={
                      <Space>
                        <Tag>{user.email}</Tag>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                          注册于 {new Date(user.createdAt).toLocaleString()}
                        </Typography.Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Space>
      )}
    </div>
  );
}

