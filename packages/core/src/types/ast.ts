export type StringLiteral = {
  type: 'String';
  value: string;
};

export type NumberLiteral = {
  type: 'Number';
  value: number;
};

export type BooleanLiteral = {
  type: 'Boolean';
  value: boolean;
};

export type NullLiteral = {
  type: 'Null';
};

export type Identifier = {
  type: 'Identifier';
  name: string;
};

export type ArrayExpression = {
  type: 'Array';
  elements: AstNode[];
};

export type ObjectExpression = {
  type: 'Object';
  properties: Array<{
    key: string;
    value: AstNode;
  }>;
};

export type CallExpression = {
  type: 'Call';
  name: string;
  arguments: AstNode[];
};

export type AstNode =
  | StringLiteral
  | NumberLiteral
  | BooleanLiteral
  | NullLiteral
  | Identifier
  | CallExpression
  | ArrayExpression
  | ObjectExpression;
