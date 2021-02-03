import React, { useState, useEffect, useMemo, useContext } from 'react';

const smack = (newlyCreatedStore) => {
  const checkForAnyPathEquality = (currentValueToCheck, pathToFind) => {
    if (!currentValueToCheck)
      throw new Error("Cannot find needed path with current wildcard");
    const currentValueToCheckKeys = Object.keys(currentValueToCheck)
      .filter(key => typeof currentValueToCheck[key] !== 'object');
    for (const key in currentValueToCheck) {
      if (pathToFind in currentValueToCheck[key]) {
        return currentValueToCheck[key][pathToFind];
      } else {
        return checkForAnyPathEquality(currentValueToCheck[key], pathToFind);
      }
    }
    return null;
  };

  const searchByWildCard = (fieldName) => {
    if (!newlyCreatedStore) throw new Error("Store is not created");
    const cataloguePath = fieldName.split('.');
    if (!cataloguePath.length) throw new Error("There is no such field name");
    else if (cataloguePath === fieldName) 
      return newlyCreatedStore[fieldName];
    else {
      if (cataloguePath[0] === '*') throw new Error("Cannot use wildcard operator from the root of the store");
      let resultPath = cataloguePath[0];
      let value = newlyCreatedStore[resultPath]
      for (let i = 1; i < cataloguePath.length; i++) {
        if (cataloguePath[i] === '*') {
          if (cataloguePath[i + 1] === "*") throw new Error("Cannot use * after *");
          else if (cataloguePath[i] === '*') {
            const wildCardValue = checkForAnyPathEquality(value, cataloguePath[i + 1]);
            if (wildCardValue) return wildCardValue;
            else throw new Error("Cannot find value with that wildcard");
          }
        } else {
          resultPath = cataloguePath[i];
          value = value[resultPath];
        }
      }
      return value;
    }
  }

  return (fieldName) => searchByWildCard(fieldName);
};

export function createStore(states, middlewares = []) {
  const listeners = [];

  function subscribe(newListener) {
    listeners.push(newListener);
  }

  const newStore = {};
  for (const key in states) {
    newStore[key] = states[key](key);
    newStore[key] = newStore[key](
      newStore, 
      () => listeners,
      middlewares
    );
  }
  const connectedSmack = smack(newStore, listeners);
  const store = { ...newStore, smack: connectedSmack, subscribe };
  return store;
};

export const createMutationController = 
  (initialState) =>
  (parentStateKey) => 
  function(storeObject, listeners, middlewares) {
    let mutations = {};
    const handleCreatingControlToEveryField = (key, state) => {
      const methodName = key[0].toUpperCase() + key.slice(1);
      const updateName = "update" + methodName;
      const clearName = "clear" + methodName;
      const currentListeners = listeners();
      const methodsObject = {
        [updateName]: (data) => {
          const prevState = { ...this[parentStateKey] }; 
          this[parentStateKey][key] = data;
          for (let i = 0; i < currentListeners.length; i++) {
            currentListeners[i](this[parentStateKey]);
          }
          for (let i = 0; i < middlewares.length; i++) {
            middlewares[i]({
              prevState: { [parentStateKey]: prevState },
              state: { [parentStateKey]: this[parentStateKey] },
              mutationName: updateName,
            });
          }
          return true;
        },
        [clearName]: () => {
          const prevState = { ...this[parentStateKey][key] };
          this[parentStateKey][key] = initialState()[key];
          for (let i = 0; i < currentListeners.length; i++) {
            currentListeners[i](this[parentStateKey]);
          }
          for (let i = 0; i < middlewares.length; i++) {
            middlewares[i]({
              prevState: { [parentStateKey]: prevState },
              state: { [parentStateKey]: this[parentStateKey] },
              mutationName: clearName,
            });
          }
          return true;
        }
      };
      return methodsObject;
    };

    let state = initialState();
    for (const key in state) {
      const mutations = handleCreatingControlToEveryField.call(storeObject, key, state);
      state = { ...state, ...mutations };    
    }

    return state;
  }


export const loggerMiddleware = (storeSnapshot) => {
  console.log(`
    -------------------------------------------------------------------
    Store has been updated with mutation: ${storeSnapshot.mutationName}
    -------------------------------------------------------------------
    ---
    | OLD STATE
    ---
    | ${JSON.stringify(storeSnapshot.prevState)}
    ---

    ---
    | NEW STATE
    ---
    | ${JSON.stringify(storeSnapshot.state)}
    ---
  `);
};

export const Context = React.createContext(null);

export const StoreProvider = ({ store, children }) => {
  let [currentUpdatedState, setCurrentUpdatedState] = useState(null);
  let [currentStore, setCurrentStore] = useState(store);
  
  store.subscribe((state) => {
    setCurrentUpdatedState({ ...state });
  });

  useEffect(() => {
    setCurrentStore({ ...store });
  }, [currentUpdatedState]);

  return (
    <Context.Provider value={currentStore}>
      {children}
    </Context.Provider>
  );
};
  
export const connect = (propsToConnect, Component) =>  {
  const getNewConnectedProps = (store) => {
    const updatedProps = {};
    for (const key in propsToConnect) {
      updatedProps[key] = store.smack(propsToConnect[key]);
    }
    return updatedProps;
  };

  return (
    <Context.Consumer>
      {value => {
        const props = getNewConnectedProps(value);
        return <Component {...props} />
      }}
    </Context.Consumer>
  );
};

const todoState = () => ({
  todos: []
});

const filterState = () => ({
  filterType: "default"
}); 

const todoController = createMutationController(todoState);
const filterController = createMutationController(filterState);

export const store = createStore({
  todo: todoController,
  filter: filterController
}, []);