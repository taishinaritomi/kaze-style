// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Ast {
  export type Node =
    | StringLiteral
    | NumberLiteral
    | BooleanLiteral
    | NullLiteral
    | Identifier
    | ArrayExpression
    | ObjectExpression
    | CallExpression;

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
    elements: Node[];
  };

  export type ObjectExpression = {
    type: 'Object';
    properties: Array<{
      key: string;
      value: Node;
    }>;
  };

  export type CallExpression = {
    type: 'Call';
    name: string;
    arguments: Node[];
  };
}
