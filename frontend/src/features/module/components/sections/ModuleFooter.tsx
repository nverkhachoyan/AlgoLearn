import React, { memo, useState } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TOCModal } from '../TOCModal';
import { ContentBackground, HeaderAndTabs } from '@/constants/Colors';
import { useAppTheme } from '@/src/context/ThemeContext';
import { Text } from '@/src/components/ui';

type ModuleFooterProps = {
  moduleName: string;
  onNext: () => void;
  onTOC: () => void;
  colors: any;
};

export const ModuleFooter: React.FC<ModuleFooterProps> = memo(({ moduleName, onNext, colors }) => {
  const { theme } = useAppTheme();
  const { dark } = theme;
  const [showTOCModal, setShowTOCModal] = useState(false);
  const params = useLocalSearchParams();
  const courseId = params.courseId as string;
  const moduleId = params.moduleId as string;
  const unitId = params.unitId as string;
  const handleTOCPress = () => {
    setShowTOCModal(true);
  };

  const handleCloseModal = () => {
    setShowTOCModal(false);
  };

  const handleModuleSelect = (
    targetModuleId: number,
    targetUnitId: number,
    targetCourseId: number
  ) => {
    setShowTOCModal(false);

    setTimeout(() => {
      router.replace({
        pathname: '/(protected)/course/[courseId]/module/[moduleId]',
        params: {
          courseId: targetCourseId,
          moduleId: targetModuleId,
          unitId: targetUnitId,
        },
      });
    }, 300);
  };

  return (
    <SafeAreaView
      edges={['bottom']}
      style={{ backgroundColor: HeaderAndTabs[dark ? 'dark' : 'light'] }}
    >
      <TOCModal
        visible={showTOCModal}
        courseId={courseId}
        moduleId={moduleId}
        unitId={unitId}
        colors={colors}
        onClose={handleCloseModal}
        onModuleSelect={handleModuleSelect}
      />
      <View
        style={[styles.stickyFooter, { backgroundColor: HeaderAndTabs[dark ? 'dark' : 'light'] }]}
      >
        <View style={styles.stickyFooterInner}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color={colors.onSurface} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleTOCPress}>
            <View style={styles.footerTitleContainer}>
              <Feather name="book-open" size={18} color={colors.onSurface} />
              <Text style={[styles.footerTitle, { color: colors.onSurface }]}>{moduleName}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={onNext}>
            <Feather name="arrow-right" size={18} color={colors.onSurface} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  stickyFooter: {
    flexDirection: 'row',
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingVertical: 10,
    borderTopEndRadius: 8,
    borderTopStartRadius: 8,
  },
  stickyFooterInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  footerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerTitle: {
    fontWeight: '500',
  },
});
