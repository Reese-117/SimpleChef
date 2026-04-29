import { useCallback, useEffect, useState } from 'react';
import { groceryService } from '@/lib/api';
import type { GroceryItemDto, GrocerySection } from '@/lib/dto';

function groupItems(allItems: GroceryItemDto[]): GrocerySection[] {
  const grouped = allItems.reduce<Record<string, GroceryItemDto[]>>((acc, item) => {
    const cat = item.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});
  return Object.keys(grouped).map((title) => ({ title, data: grouped[title] }));
}

export function useGroceryWebController() {
  const [items, setItems] = useState<GroceryItemDto[]>([]);
  const [sections, setSections] = useState<GrocerySection[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [itemName, setItemName] = useState('');
  const [merging, setMerging] = useState(false);

  const loadList = useCallback(async () => {
    try {
      const data = await groceryService.get();
      setItems(data.items);
      setSections(groupItems(data.items));
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const toggleItem = async (id: number, currentStatus: boolean) => {
    const next = !currentStatus;
    const prevItems = items;
    // Optimistic toggle keeps checklist interactions responsive.
    const optimistic = items.map((i) => (i.id === id ? { ...i, is_checked: next } : i));
    setItems(optimistic);
    setSections(groupItems(optimistic));
    try {
      await groceryService.updateItem(id, { is_checked: next });
    } catch (error) {
      console.error(error);
      // Roll back if server write fails.
      setItems(prevItems);
      setSections(groupItems(prevItems));
    }
  };

  const mergeFromPlan = async (daysForward = 7) => {
    const start = new Date();
    const end = new Date();
    // Guard against invalid/negative values from UI inputs.
    const safeDays = Number.isFinite(daysForward) ? Math.max(1, Math.floor(daysForward)) : 7;
    end.setDate(start.getDate() + safeDays);
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    setMerging(true);
    try {
      await groceryService.mergeFromPlan(fmt(start), fmt(end));
      await loadList();
    } catch (e) {
      console.error(e);
    } finally {
      setMerging(false);
    }
  };

  const shareList = async () => {
    try {
      const text = await groceryService.exportText();
      if (navigator.share) {
        await navigator.share({ text, title: 'Grocery list' });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const removeItem = async (id: number) => {
    try {
      await groceryService.deleteItem(id);
      loadList();
    } catch (e) {
      console.error(e);
    }
  };

  const addItem = async () => {
    try {
      await groceryService.addItem({
        name: itemName,
        quantity: 1,
        unit: 'pc',
        category: 'Uncategorized',
      });
      setModalVisible(false);
      setItemName('');
      loadList();
    } catch (error) {
      console.error(error);
    }
  };

  const addItemDetailed = async (payload: {
    name: string;
    quantity?: string;
    unit?: string;
    category?: string;
  }) => {
    const q = parseFloat(String(payload.quantity || '1'));
    await groceryService.addItem({
      name: payload.name,
      quantity: Number.isFinite(q) ? q : 1,
      unit: payload.unit?.trim() || 'pc',
      category: payload.category?.trim() || 'Uncategorized',
    });
    setModalVisible(false);
    setItemName('');
    await loadList();
  };

  return {
    items,
    sections,
    modalVisible,
    setModalVisible,
    itemName,
    setItemName,
    merging,
    loadList,
    toggleItem,
    mergeFromPlan,
    shareList,
    removeItem,
    addItem,
    addItemDetailed,
  };
}
