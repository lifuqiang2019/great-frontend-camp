import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Select, Button, Card, message, Space, Breadcrumb } from 'antd';
import { useNavigate, useParams, Link } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import http from '../../lib/request';

interface Category {
  id: string;
  name: string;
}

export const QuestionEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [solution, setSolution] = useState<string>('');
  
  const isEdit = !!id;

  const fetchCategories = useCallback(async () => {
    try {
      const res = await http.get<Category[]>('/questions/categories');
      setCategories(res);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchQuestion = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await http.get<any>(`/questions/${id}`);
      form.setFieldsValue(res);
      setSolution(res.solution || '');
    } catch (error) {
      console.error(error);
      message.error('加载题目失败');
    } finally {
      setLoading(false);
    }
  }, [id, form]);

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchQuestion();
    }
  }, [fetchCategories, fetchQuestion, isEdit]);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const data = { ...values, solution };
      if (isEdit) {
        await http.patch(`/questions/${id}`, data);
        message.success('更新成功');
      } else {
        await http.post('/questions', data);
        message.success('创建成功');
      }
      navigate('/questions');
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb
          items={[
            { title: <Link to="/dashboard">首页</Link> },
            { title: <Link to="/questions">题库管理</Link> },
            { title: isEdit ? '编辑题目' : '录入题目' },
          ]}
        />
      </div>

      <Card title={isEdit ? "编辑题目" : "录入题目"} loading={loading} style={{ flex: 1, display: 'flex', flexDirection: 'column' }} bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSubmit}
          style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="title"
              label="题目名称"
              rules={[{ required: true, message: '请输入题目名称' }]}
              style={{ flex: 2 }}
            >
              <Input placeholder="请输入题目名称" />
            </Form.Item>
            
            <Form.Item
              name="categoryId"
              label="题目分类"
              rules={[{ required: true, message: '请选择分类' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="请选择分类">
                {categories.map(c => (
                  <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="transcript"
            label="面试回答逐字稿"
            style={{ marginBottom: 16 }}
          >
            <Input.TextArea 
              rows={4}
              placeholder="请输入逐字稿（选填）" 
              style={{ resize: 'vertical' }}
            />
          </Form.Item>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 400 }}>
            <div className="ant-form-item-label">
              <label>题解 (Markdown)</label>
            </div>
            <div style={{ flex: 1, border: '1px solid #d9d9d9', borderRadius: 8, overflow: 'hidden' }}>
              <MDEditor
                value={solution}
                onChange={(val) => setSolution(val || '')}
                height="100%"
                preview="live"
              />
            </div>
          </div>

          <div style={{ textAlign: 'right', paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
            <Space>
              <Button onClick={() => navigate('/questions')}>取消</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {isEdit ? '保存更新' : '立即创建'}
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};
