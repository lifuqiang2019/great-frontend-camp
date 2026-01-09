import React from "react";
import { Card, Col, Row, Statistic, Typography } from "antd";

export function DashboardPage() {
  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        仪表盘
      </Typography.Title>
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="用户数" value={0} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="今日新增" value={0} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="活跃用户" value={0} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

