import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { combineReducers } from '@reduxjs/toolkit';
import practiceReducer from './slices/practiceSlice';
import bookReaderReducer from './slices/bookReaderSlice';
import storage from './storage';

const rootReducer = combineReducers({
  practice: practiceReducer,
  bookReader: bookReaderReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['practice', 'bookReader'], // Persist practice and bookReader state
  migrate: (state: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = state as Record<string, any>; // local cast for migration logic
    if (s && s.bookReader) {
      if (!s.bookReader.flashcards) {
        s.bookReader.flashcards = {};
      }
      if (!s.bookReader.pageSummaries) {
        s.bookReader.pageSummaries = {};
      }
      if (!s.bookReader.lastReadPages) {
        s.bookReader.lastReadPages = {};
      }
      if (!s.bookReader.readingSessions) {
        s.bookReader.readingSessions = {};
      } else {
        // Ensure all reading sessions have required properties
        Object.keys(s.bookReader.readingSessions).forEach((key) => {
          const session = s.bookReader.readingSessions[key];
          if (session) {
            if (!session.bookmarks) {
              session.bookmarks = [];
            }
            if (!session.highlightedPages) {
              session.highlightedPages = [];
            }
            if (session.readingTime === undefined) {
              session.readingTime = 0;
            }
            if (!session.lastReadAt) {
              session.lastReadAt = Date.now();
            }
            if (session.totalPagesRead === undefined) {
              session.totalPagesRead = 0;
            }
          }
        });
      }
      if (!s.bookReader.textHighlights) {
        s.bookReader.textHighlights = {};
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Promise.resolve(s as any);
  },
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/PAUSE', 'persist/PURGE', 'persist/REGISTER'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

