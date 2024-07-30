import { useEffect, useMemo, useState, useCallback } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { ScrollView, View, Text } from '@/components/Themed';
import { Feather } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import SectionRenderer from './components/SectionRenderer';
import {
  CodeSection,
  QuestionSection,
  Section,
  TextSection,
  VideoSection,
  QuestionState,
} from './moduleSessionTypes';
import Button from '@/components/common/Button';
import { useColorScheme } from '@/components/useColorScheme';
// import Colors from '@/constants/Colors';
import { AppRoutes } from '@/types/routes';
import { useTheme } from '@react-navigation/native';

export default function ModuleSession(props: any) {
  const colorScheme = useColorScheme();
  const { colors } = useTheme();
  const content: { sections: Section[] } = {
    sections: [
      {
        type: 'text',
        content:
          "## Welcome to JavaScript: The Language of the Web\n\nJavaScript is a versatile and powerful programming language that brings interactivity and dynamism to web pages. Let's embark on an exciting journey to learn the fundamentals of JavaScript! [Get started](https://static.vecteezy.com/system/resources/thumbnails/027/254/720/small/colorful-ink-splash-on-transparent-background-png.png)",
        position: 1,
      } as TextSection,
      {
        type: 'text',
        content:
          '![JavaScript Logo](https://static.vecteezy.com/system/resources/thumbnails/027/254/720/small/colorful-ink-splash-on-transparent-background-png.png)',
        position: 2,
      } as TextSection,
      {
        type: 'text',
        content:
          "### Key Concepts in JavaScript\n\n\n1. **Variables**: Store and manipulate data\n2. **Functions**: Reusable blocks of code\n3. **Control Flow**: Make decisions and repeat actions\n4. **Objects**: Organize and structure your code\n\nLet's start with variables!",
        position: 4,
      } as TextSection,
      {
        type: 'question',
        question_id: 1,
        question:
          'Which keyword is used to declare a constant variable in JavaScript?',
        options: [
          { id: 1, content: 'var' },
          { id: 2, content: 'let' },
          { id: 3, content: 'const' },
        ],
        correct_option_id: 3,
        position: 5,
      } as QuestionSection,
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        position: 6,
      } as VideoSection,
      {
        type: 'code',
        content:
          '\n// Declaring variables\nlet age = 25;\nconst PI = 3.14159;\n// Using variables\nconsole.log(`I am ${age} years old`);\nconsole.log(`The value of PI is ${PI}`);\nfunction hello(){const help = "true"}',
        position: 7,
      } as CodeSection,
      {
        type: 'text',
        content:
          "**Pro Tip:** Use `const` for values that won't change, and `let` for variables that might be reassigned. Avoid using `var` in modern JavaScript.",
        position: 8,
      } as TextSection,
      {
        type: 'text',
        content:
          '![JavaScript in action](https://octodex.github.com/images/minion.png)',
        position: 9,
      } as TextSection,
      {
        type: 'text',
        content:
          "Now that you've learned about variables, you're ready to start your JavaScript journey! In the next section, we'll explore functions and how they can make your code more efficient and organized.",
        position: 10,
      } as TextSection,
    ],
  };

  const sections: Section[] = content.sections;
  const sortedSections = useMemo(
    () => sections.sort((a, b) => a.position - b.position),
    [sections]
  );
  const [questionsState, setQuestionsState] = useState<
    Map<number, QuestionState>
  >(new Map());
  const [isFooterExpanded, setIsFooterExpanded] = useState(false);

  const toggleFooter = () => {
    setIsFooterExpanded(!isFooterExpanded);
  };
  const [loading, setLoading] = useState(true);

  const handleQuestionAnswer = useCallback(
    (question_id: number, selected_id: number) => {
      setQuestionsState((prevQuestionsState) => {
        const newQuestionsState = new Map(prevQuestionsState);
        const question = newQuestionsState.get(question_id);
        if (question) {
          question.has_answered = true;
          question.selected_option_id = selected_id;
          newQuestionsState.set(question_id, { ...question });
        }
        return newQuestionsState;
      });
    },
    []
  );

  useEffect(() => {
    const questionsMap = new Map();
    sections.forEach((section) => {
      if (section.type === 'question') {
        questionsMap.set(section.question_id, {
          question_id: section.question_id,
          has_answered: false,
          selected_option_id: 0,
        });
      }
    });
    setQuestionsState(questionsMap);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const unitsAndModules = [
    'Unit 1: Introduction',
    'Unit 2: Variables',
    'Unit 3: Functions',
    // Add more units and modules as needed
  ];

  return (
    <>
      <ScrollView
        stickyHeaderIndices={[0]}
        style={{ backgroundColor: colors.background }}
      >
        <View
          style={[
            styles[
              colorScheme === 'light' ? 'stickyHeaderLight' : 'stickyHeaderDark'
            ],
          ]}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Feather name='x' size={18} color='black' />
            </TouchableOpacity>
            {/* <Text style={styles.headerText}>Module 1: JavaScript</Text> */}
            <View style={styles.currentProgress} />
            <View style={styles.progressBar} />
          </View>
        </View>
        <View style={styles.viewContainer}>
          {sortedSections.map((section: any) => (
            <SectionRenderer
              key={section.position}
              section={section}
              handleQuestionAnswer={handleQuestionAnswer}
              questionsState={questionsState}
            />
          ))}
          <View style={styles.endOfModule}>
            <Button
              title='Next Module'
              onPress={() => console.log('Next Module')}
            />
          </View>
        </View>
      </ScrollView>
      <View style={styles.stickyFooter}>
        <View
          style={[
            styles.stickyFooterInner,
            { height: isFooterExpanded ? 160 : 40 },
          ]}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name='arrow-left' size={18} color='black' />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFooter}>
            <Text>
              <Feather name='book-open' /> Module 1: Algorithms
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.navigate('/ModuleSession')}>
            <Feather name='arrow-right' size={18} color='black' />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  stickyHeaderLight: {
    backgroundColor: 'white',
    paddingLeft: 20,
    paddingVertical: 20,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 30,
    borderBottomEndRadius: 8,
    borderBottomStartRadius: 8,
  },
  stickyHeaderDark: {
    backgroundColor: 'black',
    paddingLeft: 20,
    paddingVertical: 20,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 30,
    borderBottomEndRadius: 8,
    borderBottomStartRadius: 8,
  },
  stickyFooter: {
    backgroundColor: 'white',
    paddingTop: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderTopEndRadius: 8,
    borderTopStartRadius: 8,
  },
  stickyFooterInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerContent: {
    marginTop: 10,
  },
  footerItem: {
    paddingVertical: 5,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 20,
    gap: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    flex: 1,
    height: 5,
    backgroundColor: '#E5E5E5',
    borderRadius: 5,
  },
  currentProgress: {
    height: 5,
    width: '50%',
    // backgroundColor: "#FFD700",
    backgroundColor: '#25A879',
    borderRadius: 5,
  },
  viewContainer: {
    flex: 1,
    padding: 20,
  },
  endOfModule: {
    padding: 20,
    alignItems: 'center',
  },
});
