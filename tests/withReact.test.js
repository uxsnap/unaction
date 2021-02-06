import React from 'react';
import ReactDOM from 'react-dom';
import Enzyme, { mount } from 'enzyme';
import { createStore, createMutationController } from '../src';
import { connect, StoreProvider } from '../src/reactConnect';
import deepEqual from 'deep-equal';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

const todoState = () => ({
  todos: { status: -1, data: [] },  
}); 

const todoController = createMutationController(todoState);

const store = createStore({
  todo: todoController
});

export const Todos = ({ todos }) => {
  return (
    <div className="todos">
      {todos.data.map((todo) => {
        <div className="todo">
          <span>{todo.id}</span>  
          <span>{todo.name}</span>  
        </div> 
      })}
    </div> 
  );
};

export const mapProps = {
  todos: 'todo.todos'
};

export const TodosContainer = () => connect(mapProps, Todos);

const toMount = (
  <StoreProvider store={store}>
    <TodosContainer />
  </StoreProvider>
);

let wrapper = mount(toMount);

test('TodosContainer has mapped props from provided store', () => {
  expect(deepEqual(wrapper.find(Todos).props().todos, todoState().todos)).toBeTruthy();
});

test('TodosContainer updates props when store is updated', () => {
  const newTodos = { ...todoState().todos, data: [{ id: 1, name: 'First todo' }] };
  store.todo.updateTodos(newTodos);
  wrapper = mount(toMount);
  const props = wrapper.find(Todos).props();
  expect(deepEqual(props.todos, newTodos)).toBeTruthy();
});