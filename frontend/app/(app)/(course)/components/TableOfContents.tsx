import React, {useState, useRef} from 'react';
import {StyleSheet, Animated, LayoutAnimation, Platform, UIManager} from 'react-native';
import {List, Surface} from 'react-native-paper';
import {Feather} from "@expo/vector-icons";
import {Text, View} from "@/components/Themed";
import useTheme from "@/hooks/useTheme";
import {Unit} from "@/types/units";

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface CourseUnitProps {
  units: Unit[];
  onModulePress?: (moduleId: number) => void;
}

const TableOfContents: React.FC<CourseUnitProps> = ({
                                                      units = [],
                                                      onModulePress
                                                    }) => {
  const {colors} = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const [expandedId, setExpandedId] = useState<number | undefined>();

  // Animation values for rotating chevrons
  const rotationValues = useRef<{ [key: number]: Animated.Value }>({}).current;
  const mainRotation = useRef(new Animated.Value(0)).current;

  // Initialize rotation values for each unit
  React.useEffect(() => {
    units.forEach(unit => {
      if (!rotationValues[unit.id]) {
        rotationValues[unit.id] = new Animated.Value(0);
      }
    });
  }, [units]);

  const configureAnimation = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        200,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity
      )
    );
  };

  const handleMainPress = () => {
    configureAnimation();
    setIsVisible(!isVisible);
    Animated.timing(mainRotation, {
      toValue: isVisible ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = (id: number) => {
    configureAnimation();
    setExpandedId(expandedId === id ? undefined : id);

    Animated.timing(rotationValues[id], {
      toValue: expandedId === id ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleModulePress = (moduleId: number) => {
    if (onModulePress) {
      onModulePress(moduleId);
    }
  };

  const mainChevronStyle = {
    transform: [{
      rotate: mainRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg']
      })
    }]
  };

  if (!units.length) return null;

  return (
    <Surface style={styles.container}>
      <List.Section>
        <List.Accordion
          left={props => <Feather {...props} name="list" size={20} color="#fff"/>}
          right={props => (
            <Animated.View style={mainChevronStyle}>
              <Feather {...props} name="chevron-down" size={20} color="#fff"/>
            </Animated.View>
          )}
          title="Table of Contents"
          expanded={isVisible}
          onPress={handleMainPress}
          style={styles.header}
          titleStyle={styles.headerText}
        >
          {units.map((unit, unitIdx) => {
            const isUnitExpanded = expandedId === unit.id;
            const rotationStyle = {
              transform: [{
                rotate: rotationValues[unit.id]?.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '90deg']
                }) || '0deg'
              }]
            };

            return (
              <List.Accordion
                key={unit.id}
                id={unit.id}
                title={`${unitIdx + 1}. ${unit.name}`}
                expanded={isUnitExpanded}
                onPress={() => handlePress(unit.id)}
                style={[styles.unitAccordion, {backgroundColor: colors.background}]}
                titleStyle={[styles.accordionTitle, {color: colors.text}]}
                right={props => (
                  <Animated.View style={rotationStyle}>
                    <Feather name="chevron-right" size={16} color={colors.text}/>
                  </Animated.View>
                )}
              >
                <View style={styles.contentContainer}>
                  <Text style={[styles.description, {color: colors.text}]}>
                    {unit.description}
                  </Text>

                  <View style={styles.modulesList}>
                    {unit.modules?.map((module, moduleIdx) => (
                      <List.Item
                        key={module.id}
                        left={props => <Text>{unitIdx + 1}.{moduleIdx + 1}</Text>}
                        title={module.name}
                        style={[
                          styles.moduleItem,
                          {backgroundColor: colors.listBackground}
                        ]}
                        titleStyle={{color: colors.text}}
                        onPress={() => handleModulePress(module.id)}
                      />
                    ))}
                  </View>
                </View>
              </List.Accordion>
            );
          })}
        </List.Accordion>
      </List.Section>
    </Surface>
  );
};


const styles = StyleSheet.create({
  container: {
    width: '90%',
    alignSelf: 'center',
    marginVertical: 10,
    borderRadius: 5,
  },
  header: {
    backgroundColor: '#0F1421',
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  unitAccordion: {
//    paddingLeft: 16,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentContainer: {
    width: "95%",
//    padding: 6,
    paddingTop: 0,
  },
  description: {
    fontSize: 16,
    marginVertical: 16,
    textAlign: "center"
  },
  modulesList: {
    paddingLeft: 16,
  },
  moduleItem: {
    marginVertical: 4,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
});

export default React.memo(TableOfContents);