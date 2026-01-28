import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, message, Typography, Space, Divider } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import http from '../../lib/request';

const { Title, Text } = Typography;

interface SystemConfig {
  key: string;
  value: string;
  description?: string;
}

const GREETING_KEYS = [
  { key: 'greeting_0_7', label: '凌晨 (00:00 - 07:00)', default: '夜深露重，愿你好梦相伴' },
  { key: 'greeting_7_9', label: '清晨 (07:00 - 09:00)', default: '朝阳初升，今天的你也很棒' },
  { key: 'greeting_9_12', label: '上午 (09:00 - 12:00)', default: '阳光正好，用代码编织未来' },
  { key: 'greeting_12_14', label: '中午 (12:00 - 14:00)', default: '茶余饭后，给自己一段放空时光' },
  { key: 'greeting_14_18', label: '下午 (14:00 - 18:00)', default: '午后静谧，灵感在指尖流淌' },
  { key: 'greeting_18_24', label: '晚上 (18:00 - 24:00)', default: '卸下疲惫，享受属于你的宁静夜晚' },
];

export function GreetingConfigPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await http.get<SystemConfig[]>('/system/config');
      const formValues: Record<string, string> = {};
      
      // Initialize with defaults first
      GREETING_KEYS.forEach(item => {
        formValues[item.key] = item.default;
      });

      // Override with server values
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (item.key.startsWith('greeting_')) {
            formValues[item.key] = item.value;
          }
        });
      }

      form.setFieldsValue(formValues);
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: Record<string, string>) => {
    try {
      setLoading(true);
      
      // Save each key sequentially (or could be parallel)
      const promises = Object.entries(values).map(([key, value]) => {
        return http.post(`/system/config/${key}`, { value });
      });

      await Promise.all(promises);
      message.success('标语配置已更新');
    } catch (error) {
      console.error('Failed to save config:', error);
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <div>
        <Title level={2}>标语设置</Title>
        <Text type="secondary">配置不同时间段在导航栏显示的欢迎标语</Text>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          {GREETING_KEYS.map((item) => (
            <Form.Item
              key={item.key}
              label={item.label}
              name={item.key}
              rules={[{ required: true, message: '请输入标语内容' }]}
            >
              <Input placeholder={item.default} size="large" />
            </Form.Item>
          ))}

          <Divider />

          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} size="large">
              保存配置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Space>
  );
}
