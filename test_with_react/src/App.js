import { TodoContainer } from './TodoContainer';
import { store, StoreProvider } from './store';

function App() {
  return (
    <StoreProvider store={store}>
      <div className="App">
        <TodoContainer />
      </div>
    </StoreProvider>
  );
}

export default App;
