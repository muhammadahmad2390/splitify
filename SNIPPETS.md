# React Native Code Snippets

This project includes custom code snippets to speed up your React Native development. Simply type the prefix and press `Tab` to expand the snippet.

## Available Snippets

### Component Snippets

#### `rnfc` - React Native Functional Component

Creates a basic functional component with StyleSheet.

```typescript
import { View, Text, StyleSheet } from 'react-native';

const ComponentName = () => {
  return (
    <View style={styles.container}>
      <Text>ComponentName</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ComponentName;
```

#### `rnfcp` - React Native Functional Component with Props

Creates a functional component with TypeScript props interface.

#### `rnfcs` - React Native Component with SafeAreaView

Creates a component wrapped with SafeAreaView.

#### `rnfct` - React Native Component with Theme

Creates a component that uses theme constants (COLORS, SPACING, etc.).

#### `rnscreen` - React Native Screen Component

Creates a full screen component with header and content sections.

### UI Component Snippets

#### `rnbutton` - React Native Button Component

Creates a customizable button component with variants (primary, secondary, outline), loading state, and disabled state.

#### `rninput` - React Native Input Component

Creates a text input component with label and error message support.

#### `rncard` - React Native Card Component

Creates a card component with shadow and styling.

#### `rnlist` - React Native FlatList Component

Creates a FlatList component with TypeScript types.

### State Management

#### `rnstore` - Zustand Store

Creates a Zustand store with TypeScript interface.

```typescript
import { create } from 'zustand';

interface StoreState {
  value: string;
  setValue: (value: string) => void;
  reset: () => void;
}

export const useStore = create<StoreState>(set => ({
  value: '',
  setValue: value => set({ value }),
  reset: () => set({ value: '' }),
}));
```

#### `rnhook` - React Native Custom Hook

Creates a custom React hook template.

### Utility Snippets

#### `clg` - Console Log

Creates a labeled console.log statement.

```typescript
console.log('variable', variable);
```

#### `imrn` - Import React Native

Quick import statement for React Native components.

```typescript
import { View, Text, StyleSheet } from 'react-native';
```

## How to Use

1. Create a new file in your project (e.g., `Button.tsx`)
2. Type the snippet prefix (e.g., `rnbutton`)
3. Press `Tab` or `Enter` to expand the snippet
4. Use `Tab` to jump between editable placeholders
5. The component name will automatically match your filename

## Customization

You can customize these snippets by editing `.vscode/react-native.code-snippets` in your project root.

## Tips

- Snippets use the filename as the default component name
- Press `Tab` to jump between snippet placeholders
- All components include TypeScript types
- Theme-based components automatically import constants from `@/constants`
