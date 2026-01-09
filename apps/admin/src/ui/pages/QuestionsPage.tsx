import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Card, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

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
      width: 200,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Question) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/questions/edit/${record.id}`)}
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
        title="题目列表"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => navigate('/questions/create')}
          >
            录入题目
          </Button>
        }
      >
        <Table 
          columns={columns} 
          dataSource={questions} 
          rowKey="id" 
          loading={loading} 
        />
      </Card>
    </div>
  );
};
