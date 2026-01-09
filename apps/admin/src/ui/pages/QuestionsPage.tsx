import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Drawer, Form, Input, Select, Space, Card, Modal, message, Popconfirm } from 'antd';
import { PlusOutlined, SettingOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import http from '../../lib/request';

interface Category {
  id: string;
  name: string;
}

interface Question {
  id: string;
  title: string;
  content?: string;
  solution?: string;
  transcript?: string;
  categoryId: string;
  category?: Category;
}

export const QuestionsPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  
  const [form] = Form.useForm();
  const [categoryForm] = Form.useForm();

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await http.get<Question[]>('/questions');
      setQuestions(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await http.get<Category[]>('/questions/categories');
      setCategories(res);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
    fetchCategories();
  }, [fetchQuestions, fetchCategories]);

  const handleCreateCategory = async (values: { name: string }) => {
    try {
      await http.post('/questions/categories', values);
      message.success('分类创建成功');
      categoryForm.resetFields();
      fetchCategories();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingQuestion) {
        await http.patch(`/questions/${editingQuestion.id}`, values);
        message.success('更新成功');
      } else {
        await http.post('/questions', values);
        message.success('创建成功');
      }
      setDrawerVisible(false);
      form.resetFields();
      setEditingQuestion(null);
      fetchQuestions();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await http.delete(`/questions/${id}`);
      message.success('删除成功');
      fetchQuestions();
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    {
      title: '题目',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '分类',
      dataIndex: ['category', 'name'],
      key: 'category',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Question) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => {
              setEditingQuestion(record);
              form.setFieldsValue(record);
              setDrawerVisible(true);
            }}
          />
          <Popconfirm title="确定删除吗?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="题库管理"
        extra={
          <Space>
            <Button icon={<SettingOutlined />} onClick={() => setCategoryModalVisible(true)}>
              管理分类
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => {
                setEditingQuestion(null);
                form.resetFields();
                setDrawerVisible(true);
              }}
            >
              录入题目
            </Button>
          </Space>
        }
      >
        <Table 
          columns={columns} 
          dataSource={questions} 
          rowKey="id" 
          loading={loading} 
        />
      </Card>

      <Drawer
        title={editingQuestion ? "编辑题目" : "录入题目"}
        width={720}
        onClose={() => {
          setDrawerVisible(false);
          setEditingQuestion(null);
          form.resetFields();
        }}
        open={drawerVisible}
        extra={
          <Space>
            <Button onClick={() => setDrawerVisible(false)}>取消</Button>
            <Button type="primary" onClick={() => form.submit()}>提交</Button>
          </Space>
        }
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="题目名称"
            rules={[{ required: true, message: '请输入题目名称' }]}
          >
            <Input placeholder="请输入题目名称" />
          </Form.Item>
          
          <Form.Item
            name="categoryId"
            label="题目分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              {categories.map(c => (
                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label="题目描述"
          >
            <Input.TextArea rows={4} placeholder="请输入题目详细描述" />
          </Form.Item>

          <Form.Item
            name="solution"
            label="题解"
          >
            <Input.TextArea rows={6} placeholder="请输入题解" />
          </Form.Item>

          <Form.Item
            name="transcript"
            label="面试官回答逐字稿"
          >
            <Input.TextArea rows={6} placeholder="请输入逐字稿" />
          </Form.Item>
        </Form>
      </Drawer>

      <Modal
        title="分类管理"
        open={categoryModalVisible}
        onCancel={() => setCategoryModalVisible(false)}
        footer={null}
      >
        <Form layout="inline" form={categoryForm} onFinish={handleCreateCategory} style={{ marginBottom: 16 }}>
          <Form.Item name="name" rules={[{ required: true, message: '请输入分类名称' }]}>
            <Input placeholder="新分类名称" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">添加</Button>
          </Form.Item>
        </Form>
        <Table 
          dataSource={categories} 
          rowKey="id" 
          pagination={false}
          columns={[
            { title: '名称', dataIndex: 'name' },
            { title: 'ID', dataIndex: 'id' }
          ]}
        />
      </Modal>
    </div>
  );
};
