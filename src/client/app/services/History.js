import { createBrowserHistory, createHashHistory } from 'history';

let history;

if (PHONEGAP) {
  history = createHashHistory();
} 
else {
  history = createBrowserHistory();
}

export default history;
