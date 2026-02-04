import React, { useEffect, useState } from 'react';
import { Card, Form, InputNumber, Button, message, Spin, Row, Col, Popconfirm, Alert } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import http from '../../lib/request';

export const HotQuestionsConfigPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [clearing, setClearing] = useState(false);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const [limitRes, expandedLimitRes] = await Promise.all([
        http.get('/system/config/hot_questions_limit'),
        http.get('/system/config/hot_questions_expanded_limit')
      ]);

      form.setFieldsValue({
        limit: limitRes ? Number(limitRes) : 10,
        expandedLimit: expandedLimitRes ? Number(expandedLimitRes) : 20
      });
    } catch (error) {
      console.error(error);
      message.error('获取配置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      await Promise.all([
        http.post('/system/config/hot_questions_limit', { value: String(values.limit) }),
        http.post('/system/config/hot_questions_expanded_limit', { value: String(values.expandedLimit) })
      ]);
      message.success('配置已更新');
    } catch (error) {
      console.error(error);
      message.error('更新配置失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearZeroHotScore = async () => {
    try {
      setClearing(true);
      const res = await http.delete<{count: number}>('/questions/batch/zero-hot-score');
      // @ts-ignore
      const count = res.count !== undefined ? res.count : res; 
      message.success(`已成功清理 ${count} 个非热门题目`);
    } catch (error) {
      console.error(error);
      message.error('清理失败');
    } finally {
      setClearing(false);
    }
  };

  return (
    <Card title="热门配置" bordered={false}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ limit: 10, expandedLimit: 20 }}
        >
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="limit"
                label="默认显示条数"
                rules={[{ required: true, message: '请输入默认显示条数' }]}
                tooltip="首页默认显示的题目数量"
              >
                <InputNumber min={1} max={50} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="expandedLimit"
                label="展开后显示条数"
                rules={[{ required: true, message: '请输入展开后显示条数' }]}
                tooltip="点击“更多热门题目”后显示的总数量"
              >
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label=" ">
                <Button type="primary" htmlType="submit" loading={submitting}>
                  保存更改
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )}
    </Card>
  );
};
