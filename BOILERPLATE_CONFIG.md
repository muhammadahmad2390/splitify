# React Native Boilerplate Configuration Guide

This document outlines all the configurations and features included in your React Native boilerplate.

## 📁 Project Structure

```
splitify/
├── .vscode/
│   ├── react-native.code-snippets  # Custom code snippets
│   └── settings.json                # VSCode workspace settings
├── src/
│   ├── components/                  # Reusable components
│   │   ├── atoms/                   # Small, single-purpose components
│   │   └── molecules/               # Composite components
│   ├── constants/                   # App constants
│   │   ├── theme.ts                 # Theme colors, fonts, spacing
│   │   └── layout.ts                # Screen dimensions, breakpoints
│   ├── hooks/                       # Custom React hooks
│   │   └── useDebounce.ts
│   ├── navigation/                  # Navigation configuration
│   ├── screens/                     # Screen components
│   ├── services/                    # API and external services
│   │   └── api.ts                   # API service with fetch wrapper
│   ├── store/                       # Zustand state management
│   ├── types/                       # TypeScript type definitions
│   │   ├── common.ts
│   │   └── navigation.ts
│   └── utils/                       # Utility functions
│       ├── validation.ts            # Form validation helpers
│       ├── formatters.ts            # Data formatting functions
│       └── storage.ts               # AsyncStorage wrapper
├── .eslintrc.js                     # ESLint configuration
├── .prettierrc.js                   # Prettier configuration
├── .gitignore                       # Git ignore rules
└── tsconfig.json                    # TypeScript configuration
```

## 🚀 Code Snippets

Type these prefixes and press `Tab` to generate code templates:

### Component Snippets

- **`rnfc`** - Basic functional component with StyleSheet
- **`rnfcp`** - Functional component with TypeScript props
- **`rnfcs`** - Component with SafeAreaView
- **`rnfct`** - Component with theme constants
- **`rnscreen`** - Full screen component with header

### UI Components

- **`rnbutton`** - Button component with variants
- **`rninput`** - Input component with label/error
- **`rncard`** - Card component with shadow
- **`rnlist`** - FlatList component with types

### Utilities

- **`rnhook`** - Custom React hook template
- **`rnstore`** - Zustand store template
- **`clg`** - Console log with label
- **`imrn`** - Import React Native components

See [SNIPPETS.md](./SNIPPETS.md) for detailed examples.

## 🎨 Theme System

All design tokens are centralized in `src/constants/theme.ts`:

### Colors

```typescript
import { COLORS } from '@/constants';

COLORS.primary; // Primary brand color
COLORS.secondary; // Secondary color
COLORS.background; // Main background
COLORS.text; // Text color
COLORS.error; // Error state
```

### Spacing

```typescript
import { SPACING } from '@/constants';

SPACING.xs; // 4px
SPACING.sm; // 8px
SPACING.md; // 16px
SPACING.lg; // 24px
SPACING.xl; // 32px
```

### Typography

```typescript
import { FONT_SIZES, FONT_WEIGHTS } from '@/constants';

FONT_SIZES.sm; // 14px
FONT_SIZES.md; // 16px
FONT_SIZES.lg; // 18px

FONT_WEIGHTS.regular; // '400'
FONT_WEIGHTS.semibold; // '600'
FONT_WEIGHTS.bold; // '700'
```

### Shadows

```typescript
import { SHADOWS } from '@/constants';

...SHADOWS.small   // Subtle shadow
...SHADOWS.medium  // Standard shadow
...SHADOWS.large   // Prominent shadow
```

## 🔧 Utilities

### Validation (`src/utils/validation.ts`)

```typescript
import { validateEmail, validatePassword } from '@/utils';

validateEmail('user@example.com'); // true
validatePassword('Pass123'); // true if valid
validatePhoneNumber('1234567890'); // true
validateRequired('value'); // true if not empty
validateMinLength('text', 5); // true if >= 5 chars
```

### Formatters (`src/utils/formatters.ts`)

```typescript
import { formatCurrency, formatDate } from '@/utils';

formatCurrency(1234.56); // "$1,234.56"
formatDate(new Date(), 'short'); // "11/21/2025"
formatPhoneNumber('1234567890'); // "(123) 456-7890"
truncateText('Long text...', 10); // "Long text..."
capitalizeFirstLetter('hello'); // "Hello"
```

### Storage (`src/utils/storage.ts`)

```typescript
import { storage, STORAGE_KEYS } from '@/utils/storage';

// Save data
await storage.setItem(STORAGE_KEYS.USER_DATA, userData);

// Get data
const user = await storage.getItem(STORAGE_KEYS.USER_DATA);

// Remove data
await storage.removeItem(STORAGE_KEYS.USER_TOKEN);

// Clear all
await storage.clear();
```

## 🌐 API Service

The API service (`src/services/api.ts`) provides a typed wrapper around fetch:

```typescript
import { api } from '@/services/api';

// GET request
const data = await api.get('/users', { page: 1, limit: 10 });

// POST request
const newUser = await api.post('/users', {
  name: 'John',
  email: 'john@example.com',
});

// PUT request
const updated = await api.put('/users/123', { name: 'Jane' });

// DELETE request
await api.delete('/users/123');
```

### Features

- ✅ Automatic token injection from storage
- ✅ Request timeout handling (30s default)
- ✅ TypeScript support with generics
- ✅ Error handling with custom error types
- ✅ Configurable base URL via environment variables

## 🪝 Custom Hooks

### useDebounce

```typescript
import { useDebounce } from '@/hooks';

const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 500);

// debouncedSearch only updates 500ms after user stops typing
```

## 📱 Responsive Design

```typescript
import { SCREEN_WIDTH, isSmallDevice, isTablet } from '@/constants/layout';

if (isSmallDevice) {
  // Adjust layout for small screens
}

if (isTablet) {
  // Use tablet-optimized layout
}
```

## 🔒 TypeScript Types

### Navigation Types (`src/types/navigation.ts`)

```typescript
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;
```

### Common Types (`src/types/common.ts`)

```typescript
import type { User, LoadingState } from '@/types/common';

const [loading, setLoading] = useState<LoadingState>('idle');
```

## 🎯 NPM Scripts

```bash
# Development
npm start              # Start Metro bundler
npm run android        # Run on Android
npm run ios            # Run on iOS

# Code Quality
npm run lint           # Check for lint errors
npm run lint:fix       # Fix lint errors automatically
npm run format         # Format code with Prettier
npm run format:check   # Check if code is formatted
npm run type-check     # Run TypeScript compiler check

# Cleaning
npm run clean          # Clean node_modules and builds
npm run clean:android  # Clean Android build
npm run clean:ios      # Clean iOS build
```

## ⚙️ VSCode Configuration

The project includes VSCode settings (`.vscode/settings.json`) that:

- ✅ Auto-format on save
- ✅ Auto-fix ESLint errors on save
- ✅ Configure TypeScript version
- ✅ Optimize file search
- ✅ Enable snippet suggestions

## 🎨 Code Style

- **Prettier** for code formatting
- **ESLint** for code quality
- **TypeScript** for type safety
- Single quotes for strings
- 2 spaces for indentation
- Trailing commas in ES5
- LF line endings

## 🚀 Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   cd ios && pod install && cd ..
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start developing:**

   ```bash
   npm start
   npm run android  # or npm run ios
   ```

4. **Create a new component:**
   - Create new file: `src/components/atoms/MyButton.tsx`
   - Type `rnfct` and press Tab
   - Component template appears with filename as component name!

## 📚 Best Practices

### Component Organization

```typescript
// 1. Imports
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '@/constants';

// 2. Types/Interfaces
interface MyComponentProps {
  title: string;
}

// 3. Component
const MyComponent = ({ title }: MyComponentProps) => {
  // 4. Hooks
  const [state, setState] = useState('');

  // 5. Functions
  const handlePress = () => {
    // logic
  };

  // 6. Render
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
    </View>
  );
};

// 7. Styles
const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
  },
});

// 8. Export
export default MyComponent;
```

### State Management with Zustand

```typescript
// src/store/UserStore.ts
import { create } from 'zustand';

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>(set => ({
  user: null,
  setUser: user => set({ user }),
  clearUser: () => set({ user: null }),
}));

// Usage in component
import { useUserStore } from '@/store/UserStore';

const { user, setUser } = useUserStore();
```

## 🔐 Environment Variables

Create a `.env` file (use `.env.example` as template):

```
API_BASE_URL=https://api.example.com
API_TIMEOUT=30000
APP_NAME=Splitify
DEBUG_MODE=true
```

## 📝 Notes

- All paths use `@/` alias which maps to `src/` directory
- Theme constants should be used instead of hardcoded values
- API calls automatically include auth tokens from storage
- Snippets automatically use filename as component name
- Always use TypeScript types for better type safety

## 🆘 Troubleshooting

### Snippets not working?

- Make sure you're in a `.tsx` or `.ts` file
- Type the prefix and press `Tab` (not Enter)
- Check that VSCode snippets are enabled in settings

### Import alias not working?

- Restart TypeScript server: `Cmd+Shift+P` → "TypeScript: Restart TS Server"
- Make sure `tsconfig.json` and `babel.config.js` are properly configured

### Format on save not working?

- Install Prettier extension for VSCode
- Check that `.vscode/settings.json` is in your workspace

---

Happy coding! 🎉
