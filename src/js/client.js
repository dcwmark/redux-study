import axios from "axios";
import { applyMiddleware, combineReducers, createStore } from "redux";
import logger from "redux-logger";
import promise from "redux-promise-middleware";
import thunk from "redux-thunk";

const DEFAULT = 'DEFAULT';

const CHANGE_NAME = 'CHANGE_NAME';
const CHANGE_AGE = 'CHANGE_AGE';

const aUserReducer = (state = {}, action) => {

  const stateChanger = {
    [CHANGE_NAME]: () => {
      return { ...state, name: action.payload };
    },
    [CHANGE_AGE]: () => {
      return { ...state, age: action.payload };
    },
    [DEFAULT]: () => { return state; },
  };
  state = stateChanger.hasOwnProperty(action.type) ?
      stateChanger[action.type]() : stateChanger[DEFAULT]();

  return state;
  
};

const FETCH_USER_PENDING = 'FETCH_USER_PENDING';
const FETCH_USER_REJECTED = 'FETCH_USER_REJECTED';
const FETCH_USER_FULLFILLED = 'FETCH_USER_FULLFILLED';

const initUsers = {
  fetching: false,
  fetched: false,
  users: [],
  error: null
};
const usersReducer = (state = initUsers, action) => {

  const stateChanger = {
    [FETCH_USER_PENDING]: () => {
      return {
        ...state,
        fetching: true
      };
    },
    [FETCH_USER_REJECTED]: () => {
      return {
        ...state,
        fetching: false,
        error: action.payload
      };
    },
    [FETCH_USER_FULLFILLED]: () => {
      return {
        ...state,
        fetching: false,
        fetched: true,
        users: action.payload
      };
    },
    [DEFAULT]: () => { return state; },
  };
  state = stateChanger.hasOwnProperty(action.type) ?
      stateChanger[action.type]() : stateChanger[DEFAULT]();

  return state;

};

const FETCH_TODO_PENDING = 'FETCH_TODO_PENDING';
const FETCH_TODO_REJECTED = 'FETCH_TODO_REJECTED';
const FETCH_TODO_FULFILLED = 'FETCH_TODO_FULFILLED';

const initTodos = {
  fetching: false,
  fetched: false,
  todos: [],
  error: null
};
const todosReducer = (state = initTodos, action) => {

  const stateChanger = {
    [FETCH_TODO_PENDING]: () => {
      return {
        ...state,
        fetching: true
      };
    },
    [FETCH_TODO_REJECTED]: () => {
      return {
        ...state,
        fetching: false,
        error: action.payload
      };
    },
    [FETCH_TODO_FULFILLED]: () => {
      return {
        ...state,
        fetching: false,
        fetched: true,
        todos: action.payload.data
      };
    },
    [DEFAULT]: () => { return state; },
  };
  state = stateChanger.hasOwnProperty(action.type) ?
      stateChanger[action.type]() : stateChanger[DEFAULT]();

  return state;

};

const reducers = combineReducers({
  aUser: aUserReducer,
  users: usersReducer,
  todos: todosReducer,
});

/**
 * Creating your own logger via middleware.
 * Not necessary, of course, with redux-logger.
 * But a good example in using middleware.
**/
const actionLogger = (store) => (next) => (action) => {
  console.log('action logger log', action);
  next(action);
};

/**
 * First, applying our own logger, then, applying redux-logger.
**/
const middleware = applyMiddleware(promise(), thunk, actionLogger, logger());

const store = createStore(reducers, middleware);

store.subscribe(() => {
  console.log('store changed ', store.getState());
});

store.dispatch( { type: CHANGE_NAME, payload: 'Xalnaga' } );
store.dispatch( { type: CHANGE_AGE, payload: 31 } );
store.dispatch( { type: CHANGE_AGE, payload: 32 } );
store.dispatch( { type: CHANGE_AGE, payload: 34 } );

/**
 * Using redux-thunk to async-get; combining multi-dispatches.
**/
store.dispatch( (dispatch) => {
  dispatch( { type: 'FETCH_USER_PENDING' } );
  axios.get('https://jsonplaceholder.typicode.com/users')
    .then( (response) => {
      dispatch( { type: FETCH_USER_FULLFILLED, payload: response.data } )
    } )
    .catch( (error) => {
      dispatch( { type: FETCH_USER_REJECTED, payload: error } )
    } )
} );

/**
 * Using redux-promise to async-get.
**/
store.dispatch( {
  type: 'FETCH_TODO',
  payload: axios.get('https://jsonplaceholder.typicode.com/todos')
} );
