import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Button, Space, Card, message, Popconfirm, Modal, InputNumber, Input } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons';
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
  interviewerQuestion?: string;
  categoryId: string;
  category?: Category;
  hotScore?: number;
}

const HotScoreEditor: React.FC<{ id: string; score: number; onUpdate: (id: string, score: number) => Promise<void> }> = ({ id, score, onUpdate }) => {
  const [value, setValue] = useState(score);

  useEffect(() => {
    setValue(score);
  }, [score]);

  const handleBlur = () => {
    if (value !== score) {
      onUpdate(id, value);
    }
  };

  return (
    <InputNumber
      value={value}
      onChange={(val) => setValue(val || 0)}
      onBlur={handleBlur}
      min={0}
      style={{ width: 80 }}
    />
  );
};

export const QuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState('');

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

  const handleUpdateHotScore = async (id: string, score: number) => {
    try {
      await http.patch(`/questions/${id}`, { hotScore: score });
      message.success('热门指数已更新');
      fetchQuestions();
    } catch (error) {
      console.error(error);
      message.error('更新失败');
    }
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) return;

    Modal.confirm({
      title: '确认批量删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除选中的 ${selectedRowKeys.length} 个题目吗？此操作不可恢复。`,
      onOk: async () => {
        try {
          setLoading(true);
          await Promise.all(selectedRowKeys.map((id) => http.delete(`/questions/${id}`)));
          message.success('批量删除成功');
          setSelectedRowKeys([]);
          fetchQuestions();
        } catch (error) {
          console.error(error);
          message.error('删除过程中发生错误');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const filteredQuestions = useMemo(() => {
    if (!searchText) return questions;
    return questions.filter(q => 
      q.title.toLowerCase().includes(searchText.toLowerCase()) || 
      q.category?.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [questions, searchText]);

  const columns = [
    {
      title: '序号',
      key: 'index',
      width: 80,
      render: (_: unknown, __: Question, index: number) => index + 1,
    },
    {
      title: '题目',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '分类',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 150,
    },
    {
      title: '热门指数',
      dataIndex: 'hotScore',
      key: 'hotScore',
      width: 120,
      sorter: (a: Question, b: Question) => (a.hotScore || 0) - (b.hotScore || 0),
      render: (score: number, record: Question) => (
        <HotScoreEditor 
          id={record.id} 
          score={score || 0} 
          onUpdate={handleUpdateHotScore} 
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: Question) => (
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
          <Space>
            <Input 
              placeholder="搜索题目或分类" 
              prefix={<SearchOutlined />} 
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            {selectedRowKeys.length > 0 && (
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                onClick={handleBatchDelete}
              >
                批量删除 ({selectedRowKeys.length})
              </Button>
            )}
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => navigate('/questions/create')}
            >
              录入题目
            </Button>
          </Space>
        }
      >
        <Table 
          rowSelection={rowSelection}
          columns={columns} 
          dataSource={filteredQuestions} 
          rowKey="id" 
          loading={loading} 
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>
    </div>
  );
};
