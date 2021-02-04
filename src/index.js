/** 
HELPERS 
***/

const checkForAnyPathEquality = (currentValueToCheck, pathToFind) => {
  if (!currentValueToCheck) throw new Error("Cannot find needed path with current wildcard");
  const currentValueToCheckKeys = Object
    .keys(currentValueToCheck)
    .filter(key => typeof currentValueToCheck[key] !== 'object');
  for (const key in currentValueToCheck) {
    if (currentValueToCheck[key][pathToFind]) {
      return currentValueToCheck[key][pathToFind];
    } else {
      return checkForAnyPathEquality(currentValueToCheck[key], pathToFind);
    }
  }
  return null;
};

function isObject(object) {
  return object != null && typeof object === 'object';
}

function deepEqual(object1, object2) {
  if (!object1 || !object2) return false;

  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    const val1 = object1[key];
    const val2 = object2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if (areObjects && !deepEqual(val1, val2) || !areObjects && val1 !== val2) {
      return false;
    }
  }

  return true;
}

/**
HELPERS
**/


const smack = (newlyCreatedStore) => {
  const searchByWildCard = (fieldName) => {
    if (!newlyCreatedStore) throw new Error("Store is not created");
    const cataloguePath = fieldName.split('.');
    if (!cataloguePath.length) throw new Error("There is no such field name");
    else if (cataloguePath === fieldName) 
      return newlyCreatedStore[fieldName];
    else {
      if (cataloguePath[0] === '*') throw new Error("Cannot use wildcard-operator from the root of the store");
      let resultPath = cataloguePath[0];
      let value = newlyCreatedStore[resultPath]
      for (let i = 1; i < cataloguePath.length; i++) {
        if (cataloguePath[i] === '*') {
          if (cataloguePath[i + 1] === "*") throw new Error("Cannot use * after *");
          else {
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


/** STORE-CREATION FUNCTION */
export function createStore(states, middlewares = []) {
  const listeners = [];

  function subscribe(newListener) {
    listeners.push(newListener);
    return listeners.length - 1;
  }

  function unsubscribe(id) {
    listeners.splice(id, 1);
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
  const store = { ...newStore, smack: connectedSmack, subscribe, unsubscribe };
  return store;
};
/** STORE CREATION FUNCTION */


/** STATE MANGEMENT CONTROLLER */
export const createMutationController = 
  (initialState) =>
  (stateKey) => 
  function(storeObject, listeners, middlewares) {
    let mutations = {};
    const handleCreatingActionToEveryField = (key, state) => {
      const methodName = key[0].toUpperCase() + key.slice(1);
      const updateName = "update" + methodName;
      const clearName = "clear" + methodName;
      const currentListeners = listeners();
      const methodsObject = {
        [updateName]: (data) => {
          const prevState = { ...this[stateKey] }; 
          this[stateKey][key] = data;
          for (let i = 0; i < currentListeners.length; i++) {
            currentListeners[i](this[stateKey]);
          }
          for (let i = 0; i < middlewares.length; i++) {
            middlewares[i]({
              prevState: { [stateKey]: prevState },
              state: { [stateKey]: this[stateKey] },
              mutationName: updateName,
            });
          }
          return true;
        },
        [clearName]: () => {
          const prevState = { ...this[stateKey][key] };
          this[stateKey][key] = initialState()[key];
          for (let i = 0; i < currentListeners.length; i++) {
            currentListeners[i](this[stateKey]);
          }
          for (let i = 0; i < middlewares.length; i++) {
            middlewares[i]({
              prevState: { [stateKey]: prevState },
              state: { [stateKey]: this[stateKey] },
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
      const mutations = handleCreatingActionToEveryField.call(storeObject, key, state);
      state = { ...state, ...mutations };    
    }

    return state;
  }


/** STATE MANGEMENT CONTROLLER */