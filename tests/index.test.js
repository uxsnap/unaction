import { createStore, createMutationController } from '../index.js';
import deepEqual from 'deep-equal';

const removeMethodsFromStoreState = (state) => {
  const newState = { ...state };
  for (let key in newState) {
    typeof newState[key] === 'function' && delete newState[key];
  }
  return newState;
};

const filterState = () => ({
  filterType: 'default',
  filterName: 'myFilter',
  filterFromBackend: { status: -1, errors: [], data: null }
});

const filterController = createMutationController(filterState);
test('Controllers are created', () => {
  expect(filterController).toBeTruthy();
});

test('Store is created without states', () => {
  expect(createStore()).toBeTruthy();
});

const store = createStore({
  filterController
});

test('Store is created with states', () => {
  expect(store.filterController).toBeTruthy();
});

test('States data hasn\'t been affected', () => {
  const filterControllerWihtoudMethods = removeMethodsFromStoreState(store.filterController);
  expect(deepEqual(filterControllerWihtoudMethods, filterState())).toBeTruthy();
});


test('State\'s data is updating', () => {
  store.filterController.updateFilterType('new_records');
  expect(store.filterController.filterType).toBe('new_records');
});

test('State\'s data is clearing to initialState', () => {
  store.filterController.updateFilterType('new_records');
  expect(store.filterController.filterType).toBe('new_records');
  store.filterController.clearFilterType();
  expect(store.filterController.filterType).toBe(filterState().filterType);
});

test('State\'s data is not changing different fields', () => {
  store.filterController.updateFilterType('new_records');
  expect(store.filterController.filterType).toBe('new_records');
  store.filterController.clearFilterType();
  expect(store.filterController.filterName).toBe(filterState().filterName);
  expect(deepEqual(store.filterController.filterFromBackend, filterState().filterFromBackend)).toBeTruthy();
});

