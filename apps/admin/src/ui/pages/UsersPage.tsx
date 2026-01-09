import React from "react";
import { Button, Space, Table, Typography } from "antd";

type UserRow = {
  id: string;
  email: string;
  createdAt: string;
};

export function UsersPage() {
  const dataSource: UserRow[] = [];

  return (
    <div>
      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          用户
        </Typography.Title>
        <Button type="primary">新增用户</Button>
      </Space>
      <Table<UserRow>
        rowKey="id"
        style={{ marginTop: 16 }}
        dataSource={dataSource}
        columns={[
          { title: "ID", dataIndex: "id" },
          { title: "邮箱", dataIndex: "email" },
          { title: "创建时间", dataIndex: "createdAt" },
        ]}
      />
    </div>
  );
}

