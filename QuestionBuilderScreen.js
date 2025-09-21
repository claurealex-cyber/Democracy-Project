import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
// If this file is inside /components, change to: '../Supabase'
import { Supabase } from './Supabase.js';

function QuestionBuilderScreen({ route, navigation }) {
  const questionnaireId = route?.params?.questionnaireId;
  const [questionnaire, setQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    let active = true;

    const fetchQuestionnaire = async () => {
      if (!questionnaireId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setErrMsg('');
      const { data, error } = await Supabase
        .from('questionnaires')
        .select('title, nodes')
        .eq('id', questionnaireId)
        .single();

      if (!active) return;

      if (error) {
        console.error('Error fetching questionnaire:', error);
        setErrMsg('Unable to load questionnaire.');
        setQuestionnaire(null);
      } else {
        setQuestionnaire(data);
      }
      setLoading(false);
    };

    fetchQuestionnaire();
    return () => {
      active = false;
    };
  }, [questionnaireId]);

  const questionIds = useMemo(() => {
    const nodes = questionnaire?.nodes;
    // Ensure we only list keys when nodes is a plain object.
    if (nodes && typeof nodes === 'object' && !Array.isArray(nodes)) {
      return Object.keys(nodes).sort();
    }
    return [];
  }, [questionnaire]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (errMsg) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>{errMsg}</Text>
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{questionnaire.title}</Text>
        <Text style={styles.subtitle}>Questions:</Text>

        <FlatList
          data={questionIds}
          keyExtractor={(id) => id}
          renderItem={({ item: questionId }) => (
            <TouchableOpacity
              style={styles.questionItem}
              onPress={() =>
                navigation.navigate('AddQuestion', {
                  questionnaireId,
                  questionId,
                })
              }
            >
              <Text>{questionId}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text>No questions yet.</Text>}
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
