import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SectionList, Share } from 'react-native';
import { Text, Checkbox, FAB, List, TextInput, Modal, Portal, Button, IconButton, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { groceryService } from '../../services/api';
import { spacing } from '../../theme/spacing';

export default function GroceryScreen() {
  const theme = useTheme();
  const [items, setItems] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [itemName, setItemName] = useState('');
  const [sections, setSections] = useState<any[]>([]);
  const [merging, setMerging] = useState(false);

  useEffect(() => {
    loadList();
  }, []);

  const loadList = async () => {
    try {
      const data = await groceryService.get();
      setItems(data.items);
      groupItems(data.items);
    } catch (error) {
      console.error(error);
    }
  };

  const groupItems = (allItems: any[]) => {
    const grouped = allItems.reduce((acc, item) => {
      const cat = item.category || 'Uncategorized';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});

    const sectionData = Object.keys(grouped).map(key => ({
      title: key,
      data: grouped[key]
    }));
    setSections(sectionData);
  };

  const toggleItem = async (id: number, currentStatus: boolean) => {
    const next = !currentStatus;
    const prevItems = items;
    const optimistic = items.map((i) => (i.id === id ? { ...i, is_checked: next } : i));
    setItems(optimistic);
    groupItems(optimistic);
    try {
      await groceryService.updateItem(id, { is_checked: next });
    } catch (error) {
      console.error(error);
      setItems(prevItems);
      groupItems(prevItems);
    }
  };

  const mergeFromPlan = async () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
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
      await Share.share({ message: text, title: 'Grocery list' });
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
        category: 'Uncategorized'
      });
      setModalVisible(false);
      setItemName('');
      loadList();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.toolbar}>
        <Text variant="headlineSmall" style={styles.header}>
          Grocery list
        </Text>
        <View style={styles.toolbarBtns}>
          <Button mode="outlined" compact onPress={mergeFromPlan} loading={merging} disabled={merging}>
            From plan
          </Button>
          <Button mode="text" compact onPress={shareList}>
            Share
          </Button>
        </View>
      </View>
      
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={`${item.quantity || ''} ${item.unit || ''}`}
            left={() => (
              <Checkbox
                status={item.is_checked ? 'checked' : 'unchecked'}
                onPress={() => toggleItem(item.id, item.is_checked)}
              />
            )}
            right={() => (
              <IconButton icon="delete-outline" onPress={() => removeItem(item.id)} accessibilityLabel={`Delete ${item.name}`} />
            )}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text
            variant="titleSmall"
            style={[
              styles.sectionHeader,
              { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.onSurfaceVariant },
            ]}
          >
            {title}
          </Text>
        )}
        contentContainerStyle={styles.list}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        label="Add Item"
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="titleLarge">Add Item</Text>
          <TextInput label="Item Name" value={itemName} onChangeText={setItemName} />
          <Button mode="contained" onPress={addItem}>Add</Button>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  header: {
    marginBottom: spacing.xs,
  },
  toolbarBtns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  list: {
    paddingBottom: 80,
  },
  sectionHeader: {
    padding: spacing.sm,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: spacing.lg,
    right: 0,
    bottom: 0,
  },
  modal: {
    padding: spacing.xl,
    margin: spacing.lg,
    borderRadius: 8,
    gap: spacing.lg,
  },
});
