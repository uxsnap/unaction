# UNACTION
#### Convenient store management library wtih predefined actions 

Package contains functions that help you create store. Connect-to-react functionality also provided.

## Install:
```
npm i unaction
```

## Examples: 
### Create store with predefined state:
```js
import { createStore, createMutationController } from 'unaction';

const filterState = () => ({
  filterType: 'default',
  filterName: { innerFilter: 'myFilter' },
  filterFromBackend: { status: -1, errors: [], data: null }
  // ... other fields
});

const filterController = createMutationController(filterState);

const store = createStore({
  filter: filterController
}, /* here goes middleware  */);
```
### Get values from store:

```js
store.smack('filter.filterName') -> { innerFilter: 'myFilter' }
store.smack('filter.*.innerFilter') -> 'myFilter'
```

### Update values:

```js
store.filter.updateFilterType('main') -> { filterType: 'main' }
```

### Connect to React

```js
import { connect, StoreProvider } from 'unaction';

export const mapProps = {,
  filterValue: 'filter.filterValue',
  filterType: 'filter.filterType', 
};

export const Container = () => connect(mapProps, /* Wrapper component */);
```

### Other things: 
1. This library provides you with store method *subscribe* (`store.subscribe(listener)`) so you can
subscribe to store changes. You can always unsubscribe from store bu callint `store.unsubscribe(listenerId)`
2. Middlewrare object
```js
{ prevState, state /* currentState */, mutationName }
```
