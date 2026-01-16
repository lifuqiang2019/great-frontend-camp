import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Select, Button, Card, message, Space, Breadcrumb, Tabs, Upload, List, Tag, Tooltip, InputNumber } from 'antd';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { InboxOutlined, FileMarkdownOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import MDEditor from '@uiw/react-md-editor';
import http from '../../lib/request';
import type { UploadFile } from 'antd/es/upload/interface';

const { Dragger } = Upload;

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
  const [transcript, setTranscript] = useState<string>('');
  
  // Batch Import State
  const [activeTab, setActiveTab] = useState('single');
  const [batchCategoryId, setBatchCategoryId] = useState<string>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: 'pending' | 'success' | 'error' }>({});
  
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
      setTranscript(res.transcript || '');
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
      const data = { ...values, solution, transcript };
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
      message.error('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBatchImport = async () => {
    if (!batchCategoryId) {
      message.error('请先选择题目分类');
      return;
    }
    if (fileList.length === 0) {
      message.error('请先上传MD文件');
      return;
    }

    setUploading(true);
    let successCount = 0;
    let failCount = 0;
    const newProgress = { ...uploadProgress };

    for (const file of fileList) {
      if (newProgress[file.uid] === 'success') continue; // Skip already succeeded

      newProgress[file.uid] = 'pending';
      setUploadProgress({ ...newProgress });

      try {
        // In beforeUpload, the file is the RCFile object itself (which extends File)
        // It does not have originFileObj property unless it went through standard Upload onChange
        const fileObj = (file as any).originFileObj || file;
        const text = await fileObj.text();
        
        if (text === undefined) throw new Error('Empty file content');

        // Remove extension and leading "001_" pattern
        const title = file.name.replace(/\.md$/i, '').replace(/^\d+_/, '');
        
        await http.post('/questions', {
          title,
          categoryId: batchCategoryId,
          solution: text,
        });

        newProgress[file.uid] = 'success';
        successCount++;
      } catch (error) {
        console.error(`Failed to import ${file.name}`, error);
        newProgress[file.uid] = 'error';
        failCount++;
      }
      setUploadProgress({ ...newProgress });
    }

    setUploading(false);
    message.success(`导入完成: 成功 ${successCount}, 失败 ${failCount}`);
    
    if (failCount === 0) {
       message.info('所有题目导入成功，即将跳转列表页');
       setTimeout(() => navigate('/questions'), 1500);
    }
  };

  const renderSingleForm = () => (
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

        <Form.Item
          name="hotScore"
          label="热门指数"
          initialValue={0}
          style={{ width: 120 }}
          tooltip="数值越大越靠前，用于热门题目列表排序"
        >
          <InputNumber min={0} placeholder="0" style={{ width: '100%' }} />
        </Form.Item>
      </div>

      <Form.Item
        name="videoUrl"
        label="视频讲解链接"
      >
        <Input placeholder="请输入视频链接 (MP4/WebM 或 YouTube 链接)" />
      </Form.Item>

      <Form.Item
        name="interviewerQuestion"
        label="面试官提问内容"
        style={{ marginBottom: 16 }}
      >
        <Input.TextArea 
          rows={3}
          placeholder="请输入面试官提问内容（选填）" 
          style={{ resize: 'vertical' }}
        />
      </Form.Item>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Tabs
          defaultActiveKey="solution"
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          items={[
            {
              key: 'solution',
              label: '题解 (Markdown)',
              children: (
                <div style={{ height: '100%', border: '1px solid #d9d9d9', borderRadius: 8, overflow: 'hidden' }}>
                  <MDEditor
                    value={solution}
                    onChange={(val) => setSolution(val || '')}
                    height="100%"
                    preview="live"
                  />
                </div>
              ),
            },
            {
              key: 'transcript',
              label: '面试回答逐字稿 (Markdown)',
              children: (
                <div style={{ height: '100%', border: '1px solid #d9d9d9', borderRadius: 8, overflow: 'hidden' }}>
                  <MDEditor
                    value={transcript}
                    onChange={(val) => setTranscript(val || '')}
                    height="100%"
                    preview="live"
                  />
                </div>
              ),
            },
          ]}
        />
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
  );

  const renderBatchForm = () => (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ maxWidth: 600 }}>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>选择统一分类：</div>
        <Select 
          placeholder="请选择所有题目的分类" 
          style={{ width: '40%' }}
          value={batchCategoryId}
          onChange={setBatchCategoryId}
        >
          {categories.map(c => (
            <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
          ))}
        </Select>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, gap: 16 }}>
        <Dragger
          multiple
          directory={false}
          accept=".md"
          showUploadList={false}
          beforeUpload={(file) => {
            setFileList(prev => [...prev, file]);
            return false;
          }}
          style={{ padding: 20 }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽 Markdown 文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持批量上传，文件名将作为题目名称，文件内容将作为题解
          </p>
        </Dragger>

        <div style={{ flex: 1, overflow: 'auto', border: '1px solid #f0f0f0', borderRadius: 8, padding: 8 }}>
          <List
            dataSource={fileList}
            renderItem={(file) => {
              const status = uploadProgress[file.uid];
              return (
                <List.Item
                  actions={[
                    status === 'pending' && <LoadingOutlined />,
                    status === 'success' && <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                    status === 'error' && <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
                    !status && (
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => {
                          setFileList(prev => prev.filter(f => f.uid !== file.uid));
                          const newProgress = { ...uploadProgress };
                          delete newProgress[file.uid];
                          setUploadProgress(newProgress);
                        }}
                      />
                    )
                  ]}
                >
                  <List.Item.Meta
                    avatar={<FileMarkdownOutlined style={{ fontSize: 24, color: '#1677ff' }} />}
                    title={file.name}
                    description={
                      <Space>
                        <Tag>{(file.size / 1024).toFixed(1)} KB</Tag>
                        {status === 'success' && <Tag color="success">导入成功</Tag>}
                        {status === 'error' && <Tag color="error">导入失败</Tag>}
                      </Space>
                    }
                  />
                </List.Item>
              );
            }}
          />
        </div>
      </div>

      <div style={{ textAlign: 'right', paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
        <Space>
          <Button onClick={() => navigate('/questions')}>取消</Button>
          <Button 
            type="primary" 
            onClick={handleBatchImport} 
            loading={uploading}
            disabled={fileList.length === 0 || !batchCategoryId}
          >
            开始批量导入 ({fileList.length} 个文件)
          </Button>
        </Space>
      </div>
    </div>
  );

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

      <Card 
        title={isEdit ? "编辑题目" : "录入题目"}
        tabList={!isEdit ? [
          { key: 'single', tab: '单个录入' },
          { key: 'batch', tab: '批量录入' }
        ] : undefined}
        activeTabKey={activeTab}
        onTabChange={key => setActiveTab(key)}
        loading={loading} 
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }} 
        styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' } }}
      >
        {isEdit ? renderSingleForm() : (
          activeTab === 'single' ? renderSingleForm() : renderBatchForm()
        )}
      </Card>
    </div>
  );
};
