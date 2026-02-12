import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Form, Input, Card, Modal, message, Popconfirm, Space, Tooltip, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, FolderOutlined } from '@ant-design/icons';
import http from '../../lib/request';

interface Category {
  id: string;
  name: string;
}

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [form] = Form.useForm();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await http.get<Category[]>('/questions/categories');
      setCategories(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (values: { name: string }) => {
    try {
      if (editingCategory) {
        await http.patch(`/questions/categories/${editingCategory.id}`, values);
        message.success('更新成功');
      } else {
        await http.post('/questions/categories', values);
        message.success('创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error(error);
      message.error(editingCategory ? '更新失败' : '创建失败');
    }
  };

  const handleEdit = (record: Category) => {
    setEditingCategory(record);
    form.setFieldsValue({ name: record.name });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await http.delete(`/questions/categories/${id}`);
      message.success('删除成功');
      fetchCategories();
    } catch (error) {
      console.error(error);
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
             <FolderOutlined />
          </div>
          <span className="font-medium text-gray-700">{text}</span>
        </Space>
      ),
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (id: string) => (
        <Tooltip title={id}>
          <Tag color="default" className="font-mono text-gray-400">
            {id.substring(0, 6)}...
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Category) => (
        <Space>
          <Button 
            type="link" 
            size="small"
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除吗？"
            description="删除后无法恢复，且该分类下的题目将无法访问"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card
        bordered={false}
        className="shadow-sm rounded-xl"
        title={<span className="text-lg font-bold">分类管理</span>}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCategory(null);
              form.resetFields();
              setModalVisible(true);
            }}
            className="bg-blue-600 hover:bg-blue-500"
          >
            新增分类
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          pagination={false}
          className="ant-table-striped"
        />
      </Card>

      <Modal
        title={editingCategory ? "编辑分类" : "新增分类"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingCategory(null);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical" className="pt-4">
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="例如：React" size="large" />
          </Form.Item>
          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingCategory ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
