import { createStore, createMutationController } from '../../src';

export const todoState = () => ({
  todos: { status: -1, data: [] },  
});

export const filterState = () => ({
  filterName: 'name',
  filterValue: ''
});

const todoController = createMutationController(todoState);
const filterController = createMutationController(filterState);

export const store = createStore({
  todo: todoController,
  filter: filterController
});

export const { updateTodos } = store.todo;
export const { updateFilterValue, updateFilterName } = store.filter;


export const TODOS = { status: 200, data: [{id: 2, name: 'eggs'}, {id: 3, name: 'foo'}, {id: 1, name: 'bar'}]};

export const getAsyncTodos = () => {
  return Promise.resolve(TODOS);
};