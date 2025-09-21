import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { supabase } from './supabase.js';

function QuestionBuilderScreen({ route, navigation }) {
import { View, Text, StyleSheet, ActivityIndicator, FlatList, SafeAreaView } from 'react-native';
import { supabase } from './supabase.js';

function QuestionBuilderScreen({ route }) {
  const { questionnaireId } = route.params;
  const [questionnaire, setQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('questionnaires')
        .select('title, nodes')
        .eq('id', questionnaireId)
        .single();

      if (error) {
        console.error('Error fetching questionnaire:', error);
      } else {
        setQuestionnaire(data);
      }
      setLoading(false);
    };

    if (questionnaireId) {
      fetchQuestionnaire();
    }
  }, [questionnaireId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!questionnaire) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Questionnaire not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const questionIds = Object.keys(questionnaire.nodes || {});

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{questionnaire.title}</Text>
        <Text style={styles.subtitle}>Questions:</Text>
        <FlatList
          data={questionIds}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <View style={styles.questionItem}>
              <Text>{item}</Text>
            </View>
          )}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('AddQuestion', { questionnaireId })}
        >
          <Text style={styles.buttonText}>Add New Question</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  questionItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#2a4d69',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default QuestionBuilderScreen;
