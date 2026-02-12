import React, { useState, useEffect } from "react";
import { Button, Space, Table, Typography, message, Popconfirm, Tag, Modal, Form, Select, Input } from "antd";
import http from "../../lib/request";

type UserRow = {
  id: string;
  email: string;
  name?: string;
  role?: string;
  createdAt: string;
  emailVerified: boolean;
  accounts?: { providerId: string }[];
};

export function UsersPage() {
  const [dataSource, setDataSource] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await http.get<UserRow[]>("/users");
      setDataSource(res);
    } catch (error) {
      console.error(error);
      message.error("获取用户列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await http.delete(`/users/${id}`);
      message.success("删除成功");
      fetchUsers();
    } catch (error) {
      console.error(error);
      message.error("删除失败");
    }
  };

  const handleEdit = (user: UserRow) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      role: user.role || 'user'
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      await http.patch(`/users/${editingUser?.id}`, values);
      message.success("更新成功");
      setIsModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error(error);
      message.error("更新失败");
    }
  };

  return (
    <div>
      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          用户管理
        </Typography.Title>
        <Button type="primary">新增用户</Button>
      </Space>
      <Table<UserRow>
        loading={loading}
        rowKey="id"
        style={{ marginTop: 16 }}
        dataSource={dataSource}
        columns={[
          { title: "ID", dataIndex: "id", width: 100, ellipsis: true },
          { title: "用户名", dataIndex: "name" },
          { 
            title: "角色", 
            dataIndex: "role",
            render: (role: string) => {
                const color = role === 'admin' ? 'red' : 'blue';
                return <Tag color={color}>{role === 'admin' ? '管理员' : '普通用户'}</Tag>;
            }
          },
          { 
            title: "注册渠道",
            dataIndex: "accounts",
            render: (accounts: { providerId: string }[]) => {
               if (!accounts || accounts.length === 0) return <Typography.Text type="secondary">未知</Typography.Text>;
               
               const providerMap: Record<string, string> = {
                 'credential': '邮箱注册',
                 'email': '邮箱注册',
                 'github': 'GitHub',
                 'google': 'Google',
               };

               const providers = Array.from(new Set(accounts.map(a => a.providerId)));
               return providers.map(p => providerMap[p] || p).join(", ");
            }
          },
          { title: "邮箱", dataIndex: "email" },
          { 
            title: "邮箱验证", 
            dataIndex: "emailVerified",
            render: (verified: boolean) => verified ? "已验证" : "未验证"
          },
          { 
            title: "创建时间", 
            dataIndex: "createdAt",
            render: (date: string) => new Date(date).toLocaleString()
          },
          {
            title: "操作",
            key: "action",
            render: (_, record) => (
              <Space>
                <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
                <Popconfirm
                  title="确定要删除该用户吗？"
                  description="删除后无法恢复"
                  onConfirm={() => handleDelete(record.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="link" danger>删除</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title="编辑用户"
        open={isModalOpen}
        onOk={handleUpdate}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="用户名">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="user">普通用户</Select.Option>
              <Select.Option value="admin">管理员</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
