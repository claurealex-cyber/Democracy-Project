// Democracy App for Expo (React Native)
// Cross-partisan civic discussion app with Supabase persistence.

import 'react-native-gesture-handler';
import 'react-native-screens';
import React, { useState, useEffect, useContext, createContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// ---------- Supabase client (single-file / Snack style) ----------
const supabaseUrl = 'https://npkuhbtuhsgxvkkyzwsb.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wa3VoYnR1aHNneHZra3l6d3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMzUxODUsImV4cCI6MjA3MzkxMTE4NX0.GcAu_WAx23ECALUzEQ_atHcnCNGNL2e6JgsCw3cWFvg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---------- Local cache (offline / restart friendly) ----------
const ISSUES_CACHE_KEY = 'cgf.issues.v1';

async function saveIssuesToCache(list) {
  try {
    await AsyncStorage.setItem(ISSUES_CACHE_KEY, JSON.stringify(list));
  } catch {}
}

async function loadIssuesFromCache() {
  try {
    const raw = await AsyncStorage.getItem(ISSUES_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ---------- Fallback sample data if server is empty ----------
const sampleIssues = [
  {
    id: 1,
    title: 'Living Wage and Worker Protections',
    description:
      'Many Americans struggle to make ends meet despite working full-time. This issue explores policies for raising the minimum wage, supporting small businesses, and ensuring workers are treated fairly.',
    supporters: 23,
    comments: [
      {
        id: 1,
        author: 'Alex',
        content:
          'I think both major parties agree that people who work full time shouldn’t live in poverty. Ensuring a living wage is something everyone should support.',
        votes: 5,
        bridging: true,
      },
      {
        id: 2,
        author: 'Jordan',
        content:
          'Raising wages is important, but we also need to help small businesses afford the change—tax credits could bridge the gap.',
        votes: 3,
        bridging: true,
      },
    ],
  },
  {
    id: 2,
    title: 'Healthcare Affordability',
    description:
      'Health care costs continue to rise. Share ideas to reduce out-of-pocket expenses, improve access, and encourage prevention without sacrificing quality.',
    supporters: 15,
    comments: [
      {
        id: 1,
        author: 'Morgan',
        content:
          'No one should go bankrupt because of medical bills. Regardless of party, we should work together to lower prices and prioritize prevention.',
        votes: 6,
        bridging: true,
      },
    ],
  },
];

// ---------- Auth Context ----------
export const AuthContext = createContext({ user: null, setUser: () => {} });

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );
    return () => authListener?.subscription?.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------- Screens ----------
function AuthScreen({ navigation }) {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async () => {
    setErrorMsg('');
    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setUser(data.user);
        navigation.navigate('Home');
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;

        // immediate login after sign up
        const { data: loginData, error: loginError } =
          await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;
        setUser(loginData.user);
        navigation.navigate('Home');
      }
    } catch (e) {
      setErrorMsg(e.message);
      Alert.alert('Authentication error', e.message);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.authContainer}>
        <Text style={styles.authTitle}>{mode === 'login' ? 'Log In' : 'Sign Up'}</Text>
        {errorMsg ? <Text style={styles.authError}>{errorMsg}</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
          <Text style={styles.authButtonText}>
            {mode === 'login' ? 'Log In' : 'Sign Up'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          <Text style={styles.authSwitch}>
            {mode === 'login'
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Log In'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function AccountScreen({ navigation }) {
  const { user, setUser } = useContext(AuthContext);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      {!user ? (
        <View style={styles.authContainer}>
          <Text style={styles.authTitle}>Not logged in</Text>
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.authButtonText}>Log In or Sign Up</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.authContainer}>
          <Text style={styles.authTitle}>Account</Text>
          <Text style={styles.authInfo}>Email: {user.email}</Text>
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.authButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.authButton} onPress={handleSignOut}>
            <Text style={styles.authButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function Guidelines() {
  return (
    <View style={styles.guidelinesContainer}>
      <Text style={styles.guidelinesTitle}>Guidelines for Respectful Dialogue</Text>
      <Text style={styles.guideline}>• Engage with honesty, dignity and respect.</Text>
      <Text style={styles.guideline}>• Seek to understand others’ perspectives rather than persuade them.</Text>
      <Text style={styles.guideline}>• Look for common ground and shared goals where possible.</Text>
      <Text style={styles.guideline}>• Recognize the humanity of people who disagree with you.</Text>
      <Text style={styles.guideline}>• Avoid stereotypes and dehumanizing language.</Text>
    </View>
  );
}

function HomeScreen({ navigation, issues }) {
  const { user } = useContext(AuthContext);
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.appTitle}>Common Ground Forum</Text>
        {!user ? (
          <TouchableOpacity
            style={styles.authNavButton}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.authNavButtonText}>Log In / Sign Up</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.authNavButton}
            onPress={() => navigation.navigate('Account')}
          >
            <Text style={styles.authNavButtonText}>Account</Text>
          </TouchableOpacity>
        )}
        <Guidelines />
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Active Issues</Text>
        {issues.length === 0 ? (
          <Text style={styles.noIssues}>No issues yet. Be the first to start a conversation!</Text>
        ) : (
          <FlatList
            data={issues}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.issueCard}
                onPress={() => navigation.navigate('IssueDetail', { issueId: item.id })}
              >
                <Text style={styles.issueTitle}>{item.title}</Text>
                {/* iOS-friendly truncation for accessibility */}
                <Text style={styles.issueDescription} numberOfLines={3} ellipsizeMode="tail">
                  {item.description}
                </Text>
                <View style={styles.issueMeta}>
                  <Text style={styles.metaText}>Supporters: {item.supporters}</Text>
                  <Text style={styles.metaText}>Comments: {item.comments.length}</Text>
                </View>
              </TouchableOpacity>
            )}
            scrollEnabled={false}
          />
        )}
        <TouchableOpacity
          style={styles.addIssueButton}
          onPress={() => navigation.navigate('NewIssue')}
        >
          <Text style={styles.addIssueText}>Propose New Issue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------- Issue Detail ----------
function IssueDetailScreen({ route, navigation, issues, setIssues, fetchIssues }) {
  const { issueId } = route.params;
  const issueIndex = issues.findIndex((i) => i.id === issueId);
  const issue = issues[issueIndex];
  const [newComment, setNewComment] = useState('');
  const [isBridging, setIsBridging] = useState(false);
  const { user } = useContext(AuthContext);

  const handleSupport = async () => {
    const { error } = await supabase
      .from('issues')
      .update({ supporters: issue.supporters + 1 })
      .eq('id', issue.id);

    if (error) {
      Alert.alert('Could not add support', error.message);
      return;
    }

    const updated = [...issues];
    updated[issueIndex] = { ...issue, supporters: issue.supporters + 1 };
    setIssues(updated);
    saveIssuesToCache(updated).catch(() => {});
    fetchIssues();
  };

  // Ensure issue exists before commenting (helps avoid FKs with sample items)
  const handleAddComment = async () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;

    let serverIssueId = issue.id;
    let exists = true;
    const { data: probe, error: probeErr } = await supabase
      .from('issues')
      .select('id')
      .eq('id', serverIssueId)
      .maybeSingle();

    if (probeErr || !probe) exists = false;

    if (!exists) {
      const { data: created, error: createErr } = await supabase
        .from('issues')
        .insert({
          title: issue.title,
          description: issue.description,
          supporters: issue.supporters ?? 0,
        })
        .select('id')
        .single();

      if (createErr) {
        Alert.alert('Could not create the issue on the server', createErr.message);
        return;
      }
      serverIssueId = created.id;

      const updatedLocal = [...issues];
      updatedLocal[issues.findIndex(i => i.id === issue.id)] = { ...issue, id: serverIssueId };
      setIssues(updatedLocal);
      await saveIssuesToCache(updatedLocal);
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        issue_id: serverIssueId,
        author: user?.email || 'Anonymous',
        author_id: user?.id || null,
        content: trimmed,
        votes: 0,
        bridging: isBridging,
      })
      .select()
      .single();

    if (error) {
      Alert.alert('Could not post comment', error.message);
      return;
    }

    const updated = [...issues];
    const idx = updated.findIndex(i => i.id === serverIssueId);
    updated[idx] = {
      ...updated[idx],
      comments: [
        ...(updated[idx].comments || []),
        { id: data.id, author: data.author, content: data.content, votes: data.votes, bridging: data.bridging },
      ],
    };
    setIssues(updated);
    saveIssuesToCache(updated).catch(() => {});
    setNewComment('');
    setIsBridging(false);
    fetchIssues();
  };

  const handleUpvote = async (commentId) => {
    const target = issue.comments.find((c) => c.id === commentId);
    if (!target) return;

    const { error } = await supabase
      .from('comments')
      .update({ votes: target.votes + 1 })
      .eq('id', commentId);

    if (error) {
      Alert.alert('Could not upvote', error.message);
      return;
    }

    const updated = [...issues];
    const commentList = issue.comments.map((c) =>
      c.id === commentId ? { ...c, votes: c.votes + 1 } : c
    );
    updated[issueIndex] = { ...issue, comments: commentList };
    setIssues(updated);
    saveIssuesToCache(updated).catch(() => {});
    fetchIssues();
  };

  const sortedComments = [...issue.comments].sort((a, b) => {
    if (a.bridging && !b.bridging) return -1;
    if (!a.bridging && b.bridging) return 1;
    return b.votes - a.votes;
  });

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.detailContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView>
          <Text style={styles.detailTitle}>{issue.title}</Text>
          <Text style={styles.detailDescription}>{issue.description}</Text>
          <View style={styles.supportSection}>
            <Text style={styles.supportersCount}>Supporters: {issue.supporters}</Text>
            <TouchableOpacity style={styles.supportButton} onPress={handleSupport}>
              <Text style={styles.supportButtonText}>Add Your Support</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Comments</Text>
          {sortedComments.length === 0 ? (
            <Text style={styles.noComments}>No comments yet. Share your thoughts below.</Text>
          ) : (
            sortedComments.map((comment) => (
              <View
                key={comment.id}
                style={[
                  styles.commentContainer,
                  comment.bridging ? styles.bridgingComment : null,
                ]}
              >
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>{comment.author}</Text>
                  {comment.bridging && (
                    <Text style={styles.bridgingLabel}>Common Ground</Text>
                  )}
                </View>
                {/* Accessible truncation for long comments */}
                <Text style={styles.commentContent} numberOfLines={8} ellipsizeMode="tail">
                  {comment.content}
                </Text>
                <View style={styles.commentFooter}>
                  <Text style={styles.commentVotes}>Votes: {comment.votes}</Text>
                  <TouchableOpacity onPress={() => handleUpvote(comment.id)}>
                    <Text style={styles.upvoteButton}>Upvote</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          <View style={styles.newCommentSection}>
            <Text style={styles.newCommentLabel}>Add a Comment</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Share your perspective"
              value={newComment}
              multiline
              onChangeText={setNewComment}
            />
            <View style={styles.bridgingToggleContainer}>
              <TouchableOpacity
                style={[styles.toggleBox, isBridging && styles.toggleBoxChecked]}
                onPress={() => setIsBridging(!isBridging)}
              />
              <Text style={styles.toggleLabel}>This comment seeks common ground</Text>
            </View>
            <TouchableOpacity style={styles.postButton} onPress={handleAddComment}>
              <Text style={styles.postButtonText}>Post Comment</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => navigation.navigate('Chat', { topic: issue.title })}
          >
            <Text style={styles.chatButtonText}>Chat with AI about this issue</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------- New Issue ----------
function NewIssueScreen({ navigation, issues, setIssues, fetchIssues }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { user } = useContext(AuthContext);

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    if (!trimmedTitle || !trimmedDescription) return;

    if (!user) {
      Alert.alert('Please log in', 'You need to log in to post an issue.');
      return;
    }

    const { data, error } = await supabase
      .from('issues')
      .insert({ title: trimmedTitle, description: trimmedDescription, supporters: 0 })
      .select()
      .single();

    if (error) {
      Alert.alert("Couldn't post", error.message);
      return;
    }

    const newList = [...issues, { ...data, comments: [] }];
    setIssues(newList);
    saveIssuesToCache(newList).catch(() => {});
    setTitle('');
    setDescription('');
    navigation.goBack();
    fetchIssues();
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.newIssueContainer}>
        <Text style={styles.sectionTitle}>Propose a New Issue</Text>
        <TextInput
          style={styles.input}
          placeholder="Issue title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Describe the issue and why it matters"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Issue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------- Profile ----------
function ProfileScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();
      if (!error && data) {
        setFirstName(data.first_name ?? '');
        setLastName(data.last_name ?? '');
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      first_name: firstName,
      last_name: lastName,
    });
    if (error) {
      Alert.alert('Error saving profile', error.message);
    } else {
      navigation.goBack();
    }
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <View style={styles.authContainer}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.authContainer}>
        <Text style={styles.authTitle}>Edit Your Profile</Text>
        <TextInput
          style={styles.input}
          placeholder="First name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="Last name"
          value={lastName}
          onChangeText={setLastName}
        />
        <TouchableOpacity style={styles.authButton} onPress={handleSave}>
          <Text style={styles.authButtonText}>Save Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------- Chat ----------
function ChatScreen({ route }) {
  const { topic } = route.params;
  const { user } = useContext(AuthContext);

  const topicQuestions = {
    'Healthcare Affordability': {
      question: 'How do you feel about healthcare inequality?',
      options: [
        'Drugs and healthcare services should be affordable',
        'It’s fine the way it is',
        'There should be universal healthcare',
      ],
    },
    'Living Wage and Worker Protections': {
      question: 'What is your general stance on workers’ rights and wages?',
      options: [
        'We should raise wages and strengthen protections',
        'I’m satisfied with the current laws',
        'Workers need comprehensive reforms and unions',
      ],
    },
  };

  const initialMessages = [];
  if (topicQuestions[topic]) {
    const { question, options } = topicQuestions[topic];
    initialMessages.push({ sender: 'bot', content: question, options });
  } else {
    initialMessages.push({
      sender: 'bot',
      content: `Let’s explore your views on ${topic}. What concerns you about this topic?`,
    });
  }

  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const lastMessage = messages[messages.length - 1];
  const hasPendingOptions = lastMessage && lastMessage.sender === 'bot' && lastMessage.options;

  async function getBotResponse(_topic, _userMessage) {
    return `Thank you for sharing. Many people find common ground by focusing on safety and responsibility. Are there measures you think both sides might agree on?`;
  }

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg = { sender: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    const response = await getBotResponse(topic, trimmed);
    const botMsg = { sender: 'bot', content: response };
    setMessages((prev) => [...prev, botMsg]);
  };

  const handleOptionSelect = async (optionText) => {
    const userMsg = { sender: 'user', content: optionText };
    setMessages((prev) => [...prev, userMsg]);
    // Save answer (best-effort)
    await supabase.from('answers').insert({
      user_id: user?.id || null,
      topic,
      choice: optionText,
    });
    const response = await getBotResponse(topic, optionText);
    const botMsg = { sender: 'bot', content: response };
    setMessages((prev) => [...prev, botMsg]);
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.chatMessages} contentContainerStyle={{ paddingVertical: 8 }}>
          {messages.map((msg, idx) => {
            if (msg.sender === 'bot' && msg.options) {
              return (
                <View key={idx} style={{ marginBottom: 12 }}>
                  <View style={[styles.chatBubble, styles.botBubble]}>
                    <Text style={styles.botText}>{msg.content}</Text>
                  </View>
                  {msg.options.map((opt, optIdx) => (
                    <TouchableOpacity
                      key={`${idx}-${optIdx}`}
                      style={styles.optionButton}
                      onPress={() => handleOptionSelect(opt)}
                    >
                      <Text style={styles.optionButtonText}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              );
            }
            return (
              <View
                key={idx}
                style={[
                  styles.chatBubble,
                  msg.sender === 'user' ? styles.userBubble : styles.botBubble,
                ]}
              >
                <Text style={msg.sender === 'user' ? styles.userText : styles.botText}>
                  {msg.content}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {!hasPendingOptions && (
          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatInput}
              placeholder="Type your message"
              value={input}
              onChangeText={setInput}
            />
            <TouchableOpacity style={styles.chatSendButton} onPress={sendMessage}>
              <Text style={styles.chatSendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------- App Setup ----------
const Stack = createStackNavigator();

export default function App() {
  const [issues, setIssues] = useState([]);

  const fetchIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('id, title, description, supporters')
        .order('id');

      if (error) throw error;

      let commentsMap = {};
      if (data?.length) {
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select('id, author, author_id, content, votes, bridging, issue_id');

        if (!commentsError && commentsData) {
          commentsMap = commentsData.reduce((acc, c) => {
            (acc[c.issue_id] ||= []).push({
              id: c.id,
              author: c.author,
              content: c.content,
              votes: c.votes,
              bridging: c.bridging,
            });
            return acc;
          }, {});
        }
      }

      const hydrated = (data || []).map((issue) => ({
        ...issue,
        comments: commentsMap[issue.id] ?? [],
      }));

      if (hydrated.length) {
        setIssues(hydrated);
        await saveIssuesToCache(hydrated);
      } else {
        // server has no data: only show samples if we currently have nothing
        if (issues.length === 0) setIssues(sampleIssues);
      }
    } catch (err) {
      console.error('fetchIssues failed:', err);
      const cached = await loadIssuesFromCache();
      if (cached?.length) {
        setIssues(cached);
      } else if (issues.length === 0) {
        setIssues(sampleIssues);
      }
    }
  };

  useEffect(() => {
    (async () => {
      const cached = await loadIssuesFromCache();
      if (cached?.length) setIssues(cached); // quick boot
      await fetchIssues(); // then refresh from server
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Home" options={{ title: 'Common Ground' }}>
              {(props) => <HomeScreen {...props} issues={issues} />}
            </Stack.Screen>
            <Stack.Screen name="IssueDetail" options={{ title: 'Issue Details' }}>
              {(props) => (
                <IssueDetailScreen
                  {...props}
                  issues={issues}
                  setIssues={setIssues}
                  fetchIssues={fetchIssues}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="NewIssue" options={{ title: 'New Issue' }}>
              {(props) => (
                <NewIssueScreen
                  {...props}
                  issues={issues}
                  setIssues={setIssues}
                  fetchIssues={fetchIssues}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Auth" options={{ title: 'Authentication' }} component={AuthScreen} />
            <Stack.Screen name="Account" options={{ title: 'Account' }} component={AccountScreen} />
            <Stack.Screen name="Profile" options={{ title: 'Edit Profile' }} component={ProfileScreen} />
            <Stack.Screen name="Chat" options={{ title: 'AI Chat' }} component={ChatScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9fb',
  },

  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    backgroundColor: '#f9f9fb',
    flexGrow: 1,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 12,
    textAlign: 'center',
    color: '#2a4d69',
  },

  // Guidelines card
  guidelinesContainer: {
    backgroundColor: '#e8f0fe',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
      },
      android: { elevation: 1 },
    }),
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2a4d69',
  },
  guideline: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2a4d69',
    marginBottom: 8,
  },
  noIssues: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
    textAlign: 'center',
  },

  // Issue card
  issueCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    }),
  },
  issueTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c3b55',
    marginBottom: 4,
  },
  issueDescription: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
  },
  issueMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 12,
    color: '#777',
  },

  // Call-to-action
  addIssueButton: {
    backgroundColor: '#2a4d69',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    }),
  },
  addIssueText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Detail screen
  detailContainer: {
    flex: 1,
    backgroundColor: '#f9f9fb',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2a4d69',
    marginBottom: 8,
    textAlign: 'center',
  },
  detailDescription: {
    fontSize: 16,
    color: '#444',
    marginBottom: 12,
  },
  supportSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  supportersCount: {
    fontSize: 14,
    color: '#555',
  },
  supportButton: {
    backgroundColor: '#3d7ea6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    }),
  },
  supportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  noComments: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
  },

  // Comment card
  commentContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
      },
      android: { elevation: 1 },
    }),
  },
  bridgingComment: {
    backgroundColor: '#eef7fa',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentAuthor: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#2a4d69',
  },
  bridgingLabel: {
    fontSize: 12,
    color: '#217ebb',
    fontWeight: 'bold',
  },
  commentContent: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
  },
  commentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentVotes: {
    fontSize: 12,
    color: '#777',
  },
  upvoteButton: {
    color: '#217ebb',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // New comment area
  newCommentSection: {
    marginTop: 16,
    paddingVertical: 8,
  },
  newCommentLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2a4d69',
    marginBottom: 6,
  },
  commentInput: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 8,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
      },
      android: { elevation: 1 },
    }),
  },
  bridgingToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  toggleBox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#2a4d69',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleBoxChecked: {
    backgroundColor: '#2a4d69',
  },
  toggleLabel: {
    fontSize: 14,
    color: '#333',
  },
  postButton: {
    backgroundColor: '#2a4d69',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    }),
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Chat / messaging
  chatContainer: {
    flex: 1,
    backgroundColor: '#f9f9fb',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chatMessages: {
    flex: 1,
  },
  chatBubble: {
    padding: 10,
    borderRadius: 12,
    marginVertical: 4,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#3d7ea6',
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0e0',
  },
  userText: {
    color: '#fff',
    fontSize: 14,
  },
  botText: {
    color: '#333',
    fontSize: 14,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 8,
    marginRight: 8,
    fontSize: 16,
  },
  chatSendButton: {
    backgroundColor: '#2a4d69',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    }),
  },
  chatSendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Auth UI
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9fb',
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2a4d69',
  },
  authError: {
    color: '#d9534f',
    marginBottom: 8,
  },
  authInfo: {
    fontSize: 16,
    marginBottom: 16,
    color: '#333',
  },
  authButton: {
    backgroundColor: '#3d7ea6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    }),
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  authSwitch: {
    marginTop: 12,
    color: '#217ebb',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  authNavButton: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#217ebb',
    borderRadius: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    }),
  },
  authNavButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Inputs (shared)
  input: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    width: '100%',
    marginVertical: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
      },
      android: { elevation: 1 },
    }),
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  newIssueContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  // Chat option buttons
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginTop: 8,
    alignSelf: 'flex-start',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    }),
  },
  optionButtonText: {
    color: '#217ebb',
    fontWeight: '600',
  },
});
