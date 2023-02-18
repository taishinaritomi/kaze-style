type StringLiteral = {
  type: "String";
  value: string;
};

type NumberLiteral = {
  type: "Number";
  value: number;
};

type BooleanLiteral = {
  type: "Boolean";
  value: boolean;
};

type NullLiteral = {
  type: "Null";
};

type Identifier = {
  type: "Identifier";
  name: string;
};

type ArrayExpression = {
  type: "Array";
  value: Statement[];
};

type ObjectExpression = {
  type: "Object";
  properties: Array<{
    key: string;
    value: Statement;
  }>;
};

type CallExpression = {
  type: "Call";
  name: string;
  arguments: Statement[];
};

type Statement = StringLiteral | NumberLiteral | BooleanLiteral | NullLiteral | Identifier | CallExpression | ArrayExpression | ObjectExpression;
