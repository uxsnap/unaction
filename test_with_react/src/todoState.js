import { store } from './store';

const { smack, todo } = store;
const { updateTodos } = todo;

export { store, smack as todoSmack, updateTodos };
