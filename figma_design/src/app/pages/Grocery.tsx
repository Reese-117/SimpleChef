import { useState } from 'react';
import { useGroceryWebController } from '@/controllers';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { Plus, Download, Trash2, ShoppingCart } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

export default function Grocery() {
  const c = useGroceryWebController();
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Produce');

  const categories = ['Produce', 'Dairy', 'Meat', 'Bakery', 'Pantry', 'Canned Goods', 'Frozen', 'Other', 'Uncategorized'];

  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      toast.error('Please enter an item name');
      return;
    }
    try {
      await c.addItemDetailed({
        name: newItemName.trim(),
        quantity: newItemQuantity,
        unit: newItemUnit,
        category: newItemCategory,
      });
      setNewItemName('');
      setNewItemQuantity('');
      setNewItemUnit('');
      setNewItemCategory('Produce');
      toast.success('Item added');
    } catch {
      toast.error('Could not add item');
    }
  };

  const handleExport = async () => {
    try {
      await c.shareList();
      toast.success('List shared or copied');
    } catch {
      toast.error('Could not export list');
    }
  };

  const handleMerge = async () => {
    await c.mergeFromPlan();
    setShowMergeDialog(false);
    toast.success('Merged from meal plan');
  };

  const uncheckedCount = c.items.filter((item) => !item.is_checked).length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1>Grocery List</h1>
            <Button variant="outline" size="icon" type="button" onClick={handleExport}>
              <Download className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              type="button"
              disabled={c.merging}
              onClick={() => setShowMergeDialog(true)}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {c.merging ? 'Merging…' : 'Merge from Plan'}
            </Button>
            <Button className="flex-1" type="button" onClick={() => c.setModalVisible(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          {uncheckedCount > 0 && (
            <p className="text-sm text-muted-foreground mt-3">
              {uncheckedCount} item{uncheckedCount !== 1 ? 's' : ''} remaining
            </p>
          )}
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {c.items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground mb-4">Your grocery list is empty</p>
            <Button type="button" onClick={() => c.setModalVisible(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Item
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {c.sections.map(({ title, data: categoryItems }) => (
              <Card key={title}>
                <CardContent className="p-4">
                  <h3 className="mb-4">{title}</h3>
                  <div className="space-y-2">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-2 rounded hover:bg-muted transition-colors"
                      >
                        <Checkbox
                          checked={item.is_checked}
                          onCheckedChange={() => c.toggleItem(item.id, item.is_checked)}
                        />
                        <div className={`flex-1 ${item.is_checked ? 'line-through text-muted-foreground' : ''}`}>
                          <span>
                            {item.quantity != null && `${item.quantity} `}
                            {item.unit && `${item.unit} `}
                            {item.name}
                          </span>
                        </div>
                        <Button size="sm" variant="ghost" type="button" onClick={() => c.removeItem(item.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={c.modalVisible} onOpenChange={c.setModalVisible}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Item</DialogTitle>
            <DialogDescription>Add a new item to your grocery list.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Item Name</Label>
              <Input
                id="item-name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="e.g., Tomatoes"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  placeholder="e.g., 2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  placeholder="e.g., lbs"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => c.setModalVisible(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddItem}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Merge from Meal Plan</DialogTitle>
            <DialogDescription>
              Add ingredients from your planned meals for the last 7 days.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setShowMergeDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleMerge} disabled={c.merging}>
              Merge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
