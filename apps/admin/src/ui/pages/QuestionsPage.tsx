import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Button, Space, Card, message, Popconfirm, Modal, InputNumber, Input, Select, Radio } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, ExclamationCircleOutlined, SearchOutlined, ClearOutlined, SwapOutlined } from '@ant-design/icons';
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
  const [clearing, setClearing] = useState(false);
  const [isCleanModalOpen, setIsCleanModalOpen] = useState(false);
  const [cleanType, setCleanType] = useState<'hotScore' | 'category'>('hotScore');
  const [cleanThreshold, setCleanThreshold] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryToClean, setSelectedCategoryToClean] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [targetCategory, setTargetCategory] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await http.get<Category[]>('/questions/categories');
      setCategories(res);
    } catch (error) {
      console.error(error);
    }
  }, []);

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
    fetchCategories();
  }, [fetchQuestions, fetchCategories]);

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

  const handleConfirmClean = async () => {
    try {
      setClearing(true);
      let res: { count: number } | any;
      
      if (cleanType === 'hotScore') {
        res = await http.delete<{ count: number }>(`/questions/batch/by-score?threshold=${cleanThreshold}`);
      } else {
        if (!selectedCategoryToClean) return;
        res = await http.delete<{ count: number }>(`/questions/batch/by-category?categoryId=${selectedCategoryToClean}`);
      }

      // @ts-ignore
      const count = res.count !== undefined ? res.count : res;
      message.success(`已成功清理 ${count} 个题目`);
      fetchQuestions();
      setIsCleanModalOpen(false);
      
      // Reset states
      setSelectedCategoryToClean(null);
      setCleanThreshold(0);
    } catch (error) {
      console.error(error);
      message.error('清理失败');
    } finally {
      setClearing(false);
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

  const handleConfirmMove = async () => {
    if (!targetCategory) return;
    
    try {
      setMoving(true);
      await Promise.all(selectedRowKeys.map((id) => http.patch(`/questions/${id}`, { categoryId: targetCategory })));
      message.success(`已成功移动 ${selectedRowKeys.length} 个题目`);
      setSelectedRowKeys([]);
      fetchQuestions();
      setIsMoveModalOpen(false);
      setTargetCategory(null);
    } catch (error) {
      console.error(error);
      message.error('移动失败');
    } finally {
      setMoving(false);
    }
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const filteredQuestions = useMemo(() => {
    let result = questions;

    if (selectedCategory) {
      result = result.filter(q => q.categoryId === selectedCategory);
    }

    if (searchText) {
      result = result.filter(q => 
        q.title.toLowerCase().includes(searchText.toLowerCase()) || 
        q.category?.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return result;
  }, [questions, searchText, selectedCategory]);

  const columns = [
    {
      title: '序号',
      key: 'index',
      width: 80,
      render: (_: unknown, __: Question, index: number) => index + 1,
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id: string) => <span title={id} style={{ fontFamily: 'monospace' }}>{id.substring(0, 6)}</span>,
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
      <Modal
        title="批量清理题目"
        open={isCleanModalOpen}
        onOk={handleConfirmClean}
        onCancel={() => setIsCleanModalOpen(false)}
        confirmLoading={clearing}
        okText="确认清理"
        cancelText="取消"
        okButtonProps={{ 
          danger: true, 
          disabled: cleanType === 'category' && !selectedCategoryToClean 
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <Radio.Group 
            value={cleanType} 
            onChange={e => setCleanType(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="hotScore">按热度清理</Radio.Button>
            <Radio.Button value="category">按分类清理</Radio.Button>
          </Radio.Group>
        </div>

        {cleanType === 'hotScore' ? (
          <>
            <p>将删除热门指数小于等于以下数值的所有题目：</p>
            <InputNumber
              value={cleanThreshold}
              onChange={(val) => setCleanThreshold(val || 0)}
              min={0}
              style={{ width: '100%' }}
            />
          </>
        ) : (
          <>
            <p>请选择要清空的题目分类：</p>
            <Select
              style={{ width: '100%' }}
              placeholder="选择分类"
              value={selectedCategoryToClean}
              onChange={setSelectedCategoryToClean}
              options={categories.map(c => ({ label: c.name, value: c.id }))}
            />
          </>
        )}
        
        <p style={{ marginTop: 8, color: '#ff4d4f', fontSize: 12 }}>
          <ExclamationCircleOutlined /> 此操作不可恢复，请谨慎操作。
        </p>
      </Modal>
      <Modal
        title="批量移动分类"
        open={isMoveModalOpen}
        onOk={handleConfirmMove}
        onCancel={() => setIsMoveModalOpen(false)}
        confirmLoading={moving}
        okText="确认移动"
        cancelText="取消"
        okButtonProps={{ disabled: !targetCategory }}
      >
        <p>请选择要移动到的目标分类：</p>
        <Select
          style={{ width: '100%' }}
          placeholder="选择目标分类"
          value={targetCategory}
          onChange={setTargetCategory}
          options={categories.map(c => ({ label: c.name, value: c.id }))}
        />
      </Modal>
      <Card
        title="题目列表"
        extra={
          <Space>
            <Select
              style={{ width: 150 }}
              placeholder="筛选分类"
              allowClear
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={categories.map(c => ({ label: c.name, value: c.id }))}
            />
            <Input 
              placeholder="搜索题目" 
              prefix={<SearchOutlined />} 
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            {selectedRowKeys.length > 0 && (
              <>
                <Button 
                  icon={<SwapOutlined />} 
                  onClick={() => setIsMoveModalOpen(true)}
                >
                  批量移动 ({selectedRowKeys.length})
                </Button>
                <Button 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={handleBatchDelete}
                >
                  批量删除 ({selectedRowKeys.length})
                </Button>
              </>
            )}
            <Button 
              icon={<DeleteOutlined />} 
              loading={clearing}
              onClick={() => {
                setCleanType('hotScore');
                setCleanThreshold(0);
                setSelectedCategoryToClean(null);
                setIsCleanModalOpen(true);
              }}
            >
              批量清理
            </Button>
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
