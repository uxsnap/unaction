import React, { useState, useEffect } from 'react';
/** Context that provides access to fresh store */
export const Context = React.createContext(null);


/** --Provider component 
  Rerenders 2 times ( need to reduce rerenders to 1 somehow )
*/
export const StoreProvider = ({ store, children }) => {
  let [currentUpdatedState, setCurrentUpdatedState] = useState(null);
  let [isStatesEqual, setIsStatesEqual] = useState(true);
  let [currentStore, setCurrentStore] = useState(store);

  function checkIfCurrentStateIsChanged(state) {
    const newState = { ...state };
    const isEqual = deepEqual(newState, currentUpdatedState);
    setIsStatesEqual(isEqual);
    !isEqual && setCurrentUpdatedState(newState);
  };

  useEffect(() => {
    const uniqueId = store.subscribe(checkIfCurrentStateIsChanged);
    !isStatesEqual && setCurrentStore({ ...store });
    return () => {
      store.unsubscribe(uniqueId);
    };
  }, [currentUpdatedState]);

  return (
    <Context.Provider value={currentStore}>
      {children}
    </Context.Provider>
  );
};

/** Connect function that takes props connected to component as strings
    and Component that will be connected.
    Returns function 
**/
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
      {store => {
        const props = getNewConnectedProps(store);
        return <Component {...props} />
      }}
    </Context.Consumer>
  );
};
