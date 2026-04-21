import { useState } from 'react';
import { useNavigate } from 'react-router';
import { recipeService } from '@/lib/api';

export function useAddRecipeWebController() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const goManual = () => {
    navigate('/add');
  };

  const parseAndContinue = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const parsedData = await recipeService.parse(text);
      const encoded = encodeURIComponent(JSON.stringify(parsedData));
      navigate(`/add?tab=manual&initialData=${encoded}`);
      setModalVisible(false);
      setText('');
    } catch (error) {
      console.error(error);
      setSnackbar('Failed to parse recipe. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    text,
    setText,
    modalVisible,
    setModalVisible,
    loading,
    snackbar,
    setSnackbar,
    goManual,
    parseAndContinue,
  };
}
