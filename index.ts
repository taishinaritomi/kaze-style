import { compile, serialize, stringify } from 'stylis';

const css = '.red{ color:red }';

console.log(serialize(compile(css), stringify));
