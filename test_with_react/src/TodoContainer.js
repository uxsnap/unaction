import React from 'react';
import { connect } from './store';
import { todoSmack, updateTodos, store } from './todoState';

const propsToConnect = {
  todos: 'todo.todos',
  filter: 'filter.filterType'  
};
 
export const TodoComponent = ({ todos }) => {
  const onClick = () => {
    updateTodos([...todos, { id: Math.floor(Math.random() * 10), name: "Double no" }]);
  };

  return (
    <div>
      <ul>
        {todos.map((todo) => <li key={todo.id}>
          <span>{todo.id}</span>
          <span>{todo.name}</span>
        </li>)}
      </ul>
      <button onClick={onClick}>Click</button>
    </div>
  );
};

export const TodoContainer = () => connect(propsToConnect, TodoComponent);
