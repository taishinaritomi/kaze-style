use serde::{Deserialize, Serialize};
use swc_core::{
  common::DUMMY_SP,
  ecma::ast::{
    ArrayLit, Bool, CallExpr, Callee, Expr, ExprOrSpread, Ident, KeyValueProp, Lit, Null, Number,
    ObjectLit, Prop, PropName, PropOrSpread, Str,
  },
};

#[derive(Serialize, Deserialize, Debug)]
pub struct StringLiteral {
  value: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct NumberLiteral {
  value: u8,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct BooleanLiteral {
  value: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct NullLiteral {}

#[derive(Serialize, Deserialize, Debug)]
pub struct Identifier {
  name: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ArrayExpression {
  value: Vec<Node>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ObjectProperty {
  key: String,
  value: Node,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ObjectExpression {
  properties: Vec<ObjectProperty>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CallExpression {
  name: String,
  import_source: Option<String>,
  arguments: Vec<Node>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type")]
pub enum Node {
  String(StringLiteral),
  Number(NumberLiteral),
  Boolean(BooleanLiteral),
  Null(NullLiteral),
  Identifier(Identifier),
  Array(ArrayExpression),
  Object(ObjectExpression),
  Call(CallExpression),
}

pub fn node_to_expr(value: &Node) -> Expr {
  match value {
    Node::String(string) => Expr::Lit(Lit::Str(Str {
      value: string.value.to_string().into(),
      span: DUMMY_SP,
      raw: None,
    })),
    Node::Number(number) => Expr::Lit(Lit::Num(Number {
      value: number.value.into(),
      span: DUMMY_SP,
      raw: None,
    })),
    Node::Boolean(boolean) => Expr::Lit(Lit::Bool(Bool {
      value: boolean.value.into(),
      span: DUMMY_SP,
    })),
    Node::Null(_null) => Expr::Lit(Lit::Null(Null { span: DUMMY_SP })),
    Node::Identifier(ident) => Expr::Ident(Ident {
      optional: false,
      span: DUMMY_SP,
      sym: ident.name.to_string().into(),
    }),
    Node::Array(array) => Expr::Array(ArrayLit {
      span: DUMMY_SP,
      elems: array
        .value
        .iter()
        .map(|node| {
          Some(ExprOrSpread {
            spread: None,
            expr: Box::new(node_to_expr(node)),
          })
        })
        .collect::<Vec<Option<ExprOrSpread>>>(),
    }),
    Node::Object(object) => Expr::Object(ObjectLit {
      span: DUMMY_SP,
      props: object
        .properties
        .iter()
        .map(|object_property| {
          PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
            key: PropName::Str(Str {
              raw: None,
              span: DUMMY_SP,
              value: object_property.key.to_string().into(),
            }),
            value: Box::new(node_to_expr(&object_property.value)),
          })))
        })
        .collect::<Vec<PropOrSpread>>(),
    }),
    Node::Call(call) => Expr::Call(CallExpr {
      span: DUMMY_SP,
      args: call
        .arguments
        .iter()
        .map(|argument| ExprOrSpread {
          spread: None,
          expr: Box::new(node_to_expr(argument)),
        })
        .collect::<Vec<ExprOrSpread>>(),
      callee: Callee::Expr(Box::new(Expr::Ident(Ident {
        optional: false,
        span: DUMMY_SP,
        sym: call.name.to_string().into(),
      }))),
      type_args: None,
    }),
  }
}
