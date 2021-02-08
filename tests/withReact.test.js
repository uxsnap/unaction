import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import Enzyme, { mount } from 'enzyme';
import { connect, StoreProvider } from '../reactConnect';
import deepEqual from 'deep-equal';
import Adapter from 'enzyme-adapter-react-16';
import { 
  TODOS, 
  todoState, 
  filterState, 
  store, 
  updateTodos, 
  updateFilterValue, 
  updateFilterName, 
  getAsyncTodos
} from './helpers';

Enzyme.configure({ adapter: new Adapter() });

export const Todos = ({ todos, filterName, filterValue }) => {

  useEffect(() => {
    getAsyncTodos()
      .then((res) => updateTodos(res)); 
  }, [filterValue]);

  const updateFilter = (event) => updateFilterValue(event.target.value);

  const filteredTodos = todos.data.filter((todo) => todo[filterName].includes(filterValue));

  return (
    <div className="container">
      <input onChange={updateFilter}/> 
      <div className="todos">
        {filteredTodos.map((todo) => {
          <div className="todo">
            <span>{todo.id}</span>  
            <span>{todo.name}</span>  
          </div> 
        })}
      </div> 
    </div>
  );
};

export const mapProps = {
  todos: 'todo.todos',
  filterValue: 'filter.filterValue',
  filterName: 'filter.filterName', 
};

export const TodosContainer = () => connect(mapProps, Todos);

const toMount = (
  <StoreProvider store={store}>
    <TodosContainer />
  </StoreProvider>
);

let wrapper= mount(toMount);

describe('TodosContainer tests', () => {
  test('mapped props from provided store', () => {
    expect(deepEqual(wrapper.find(Todos).props().todos, todoState().todos)).toBeTruthy();
  });

  test('updates props when store is updated', () => {
    const newTodos = { ...todoState().todos, data: [{ id: 1, name: 'First todo' }] };
    updateTodos(newTodos);
    wrapper = mount(toMount);
    const props = wrapper.find(Todos).props();
    expect(deepEqual(props.todos, newTodos)).toBeTruthy();
  });

  test('async filter action', () => {
    updateFilterValue('bar');
    wrapper = mount(toMount);
    const wrappedComponent = wrapper.find(Todos);
    const { filterValue, filterName, todos } = wrappedComponent.props();
    expect(filterValue).toBe('bar');
    expect(filterName).toBe('name');
    expect(todos).toBe(TODOS);
    updateFilterValue('eggs');
    expect(wrappedComponent.props().todos).toBe(TODOS);
  });

  test('error with non-correct props', () => {
    const errorTest = () => {
      updateFilterName('bar');
      wrapper = mount(toMount);
      const wrappedComponent = wrapper.find(Todos);
    };
    expect(errorTest).toThrow(TypeError);
  });
});
