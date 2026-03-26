import { UserRole, type User } from '@/types';
import { setupAxios } from '@/utils/setupAxios';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import QueryString from 'qs';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';
import { Auth, AuthSlice, authPersistConfig } from './_auth';
import { ConfigSlice, configPersistConfig } from './_config';
import { ReaderSlice, readerPersistConfig } from './_reader';
import { ViewSlice, viewPersistConfig } from './_view';

const reducer = combineReducers({
  view: persistReducer(viewPersistConfig, ViewSlice.reducer),
  auth: persistReducer(authPersistConfig, AuthSlice.reducer),
  reader: persistReducer(readerPersistConfig, ReaderSlice.reducer),
  config: persistReducer(configPersistConfig, ConfigSlice.reducer),
});

export type RootState = ReturnType<typeof reducer>;

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export async function onBeforeLift() {
  setupAxios();

  const state = store.getState();
  const query = QueryString.parse(location.search.substring(1));

  // local user login
  const token = query.authToken
    ? decodeURIComponent(String(query.authToken))
    : Auth.select.authToken(state);
  if (token) {
    try {
      const { data: user } = await axios.get<User>(`/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      store.dispatch(Auth.action.login({ token, user }));
    } catch {
      store.dispatch(Auth.action.logout());
    }
  }

  // set view as
  if (query.viewAs) {
    const viewAs = String(query.viewAs);
    if (Object.values(UserRole).includes(viewAs)) {
      store.dispatch(Auth.action.setViewAs(viewAs));
    }
  } else {
    store.dispatch(Auth.action.setViewAs());
  }
}
