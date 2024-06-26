declare module 'react-native-svg-charts' {
    import { ReactNode } from 'react';
    import { ComponentType } from 'react';
    import { ViewStyle } from 'react-native';
    import { SvgProps } from 'react-native-svg';
  
    export const LineChart: ComponentType<{
      data: number[];
      style?: ViewStyle;
      svg?: SvgProps;
      contentInset?: { top: number; bottom: number };
      curve?: any;
      children?: ReactNode; // Add this line
    }>;
  }
  