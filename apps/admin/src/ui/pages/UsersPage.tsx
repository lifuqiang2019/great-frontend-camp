import React, { useState, useEffect } from "react";
import { Button, Space, Table, Typography, message, Popconfirm } from "antd";
import http from "../../lib/request";

type UserRow = {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  emailVerified: boolean;
};

export function UsersPage() {
  const [dataSource, setDataSource] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div>
      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          用户
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
              <Popconfirm
                title="确定要删除该用户吗？"
                description="删除后无法恢复"
                onConfirm={() => handleDelete(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button type="link" danger>
                  删除
                </Button>
              </Popconfirm>
            ),
          },
        ]}
      />
    </div>
  );
}

