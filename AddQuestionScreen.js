import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { supabase } from './supabase.js';

function AddQuestionScreen({ route, navigation }) {
  const { questionnaireId } = route.params;
  const [questionId, setQuestionId] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const qId = questionId.trim();
    const qText = questionText.trim();

    if (!qId || !qText) {
      Alert.alert('Error', 'Question ID and text cannot be empty.');
      return;
    }

    setLoading(true);

    // 1. Fetch current questionnaire
    const { data: questionnaire, error: fetchError } = await supabase
      .from('questionnaires')
      .select('nodes')
      .eq('id', questionnaireId)
      .single();

    if (fetchError) {
      Alert.alert('Error fetching questionnaire', fetchError.message);
      setLoading(false);
      return;
    }

    // 2. Check for duplicate ID and add new node
    const newNodes = { ...questionnaire.nodes };
    if (newNodes[qId]) {
      Alert.alert('Error', 'This Question ID already exists.');
      setLoading(false);
      return;
    }
    newNodes[qId] = {
      id: qId,
      type: 'single', // Default to single choice
      text: qText,
      options: [],
    };

    // 3. Update the record
    const { error: updateError } = await supabase
      .from('questionnaires')
      .update({ nodes: newNodes })
      .eq('id', questionnaireId);

    if (updateError) {
      Alert.alert('Error saving question', updateError.message);
    } else {
      navigation.goBack();
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Add New Question</Text>

        <Text style={styles.label}>Question ID</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., q2, background_check_q"
          value={questionId}
          onChangeText={setQuestionId}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Question Text</Text>
        <TextInput
          style={[styles.input, { minHeight: 80 }]}
          placeholder="Enter the question text here"
          value={questionText}
          onChangeText={setQuestionText}
          multiline
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Save Question</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9fb',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    backgroundColor: '#2a4d69',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#a9a9a9',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AddQuestionScreen;
