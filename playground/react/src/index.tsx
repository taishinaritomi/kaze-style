import * as ReactDOM from 'react-dom';
import { App } from './App';

if (typeof document !== 'undefined') {
  const root = document.createElement('div');
  document.body.appendChild(root);
  ReactDOM.render(<App />, root);
}
