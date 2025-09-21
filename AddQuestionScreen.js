import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, Modal, FlatList } from 'react-native';
import { supabase } from './supabase.js';

function AddQuestionScreen({ route, navigation }) {
  const { questionnaireId } = route.params;
  const [questionId, setQuestionId] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [optionLabel, setOptionLabel] = useState('');
  const [optionValue, setOptionValue] = useState('');
  const [optionNext, setOptionNext] = useState('');

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
      options: options,
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

  const handleAddOption = () => {
    if (!optionLabel.trim() || !optionValue.trim() || !optionNext.trim()) {
      Alert.alert('Error', 'All option fields are required.');
      return;
    }
    const newOption = {
      label: optionLabel.trim(),
      value: optionValue.trim(),
      next: optionNext.trim(),
    };
    setOptions([...options, newOption]);
    setOptionLabel('');
    setOptionValue('');
    setOptionNext('');
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Add New Option</Text>
            <TextInput
              style={styles.input}
              placeholder="Option Label (e.g., Yes)"
              value={optionLabel}
              onChangeText={setOptionLabel}
            />
            <TextInput
              style={styles.input}
              placeholder="Option Value (e.g., yes_option)"
              value={optionValue}
              onChangeText={setOptionValue}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Next Question ID (e.g., q3)"
              value={optionNext}
              onChangeText={setOptionNext}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.button} onPress={handleAddOption}>
              <Text style={styles.buttonText}>Add Option</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, {backgroundColor: '#6c757d'}]} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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

        <Text style={styles.label}>Options</Text>
        <FlatList
          data={options}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.optionItem}>
              <Text>{item.label}</Text>
            </View>
          )}
          ListEmptyComponent={<Text>No options added yet.</Text>}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add Option</Text>
        </TouchableOpacity>

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
  optionItem: {
    backgroundColor: '#e9ecef',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#6c757d',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default AddQuestionScreen;
