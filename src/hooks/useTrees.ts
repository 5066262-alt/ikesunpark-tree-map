'use client';

import { useState, useEffect } from 'react';
import { TreeData } from '../types';

export function useTrees() {
  const [trees, setTrees] = useState<TreeData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 初回ロード時にAPIからデータを取得
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/trees');
        if (!res.ok) throw new Error('Failed to fetch tree data');
        const data = await res.json();
        if (data.success) {
          setTrees(data.trees || []);
        } else {
          throw new Error(data.error || 'Failed to fetch tree data');
        }
      } catch (error) {
        console.error('Failed to load tree data:', error);
        alert('樹木データの読み込みに失敗しました。');
      } finally {
        setIsLoaded(true);
      }
    };
    
    loadData();
  }, []);

  // データの保存（追加・更新）
  const saveTree = async (newTree: TreeData) => {
    setIsSaving(true);
    const previousTrees = [...trees];
    
    // 1. Optimistic Update (UIを即座に更新)
    setTrees(prev => {
      const existingIndex = prev.findIndex(t => t.id === newTree.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newTree;
        return updated;
      } else {
        return [...prev, newTree];
      }
    });

    try {
      // 2. API Request
      const res = await fetch('/api/trees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTree),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save tree data');
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to save tree data');
      }
    } catch (error: any) {
      console.error('Failed to save tree:', error);
      alert(`保存に失敗しました: ${error.message}`);
      // Rollback on failure
      setTrees(previousTrees);
    } finally {
      setIsSaving(false);
    }
  };

  // データの削除
  const deleteTree = async (id: string) => {
    const previousTrees = [...trees];

    // 1. Optimistic Update (UIを即座に更新)
    setTrees(prev => prev.filter(t => t.id !== id));

    try {
      // 2. API Request
      const res = await fetch(`/api/trees?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete tree');
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete tree');
      }
    } catch (error: any) {
      console.error('Failed to delete tree:', error);
      alert(`削除に失敗しました: ${error.message}`);
      // Rollback on failure
      setTrees(previousTrees);
    }
  };

  return {
    trees,
    isLoaded,
    isSaving,
    saveTree,
    deleteTree
  };
}

