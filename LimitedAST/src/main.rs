use serde::{Deserialize, Serialize};
use std::vec;

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
  value: Vec<Statement>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ObjectProperty {
  key: String,
  value: Statement,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ObjectExpression {
  properties: Vec<ObjectProperty>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CallExpression {
  name: String,
  arguments: Vec<Statement>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type")]
enum Statement {
  String(StringLiteral),
  Number(NumberLiteral),
  Boolean(BooleanLiteral),
  Null(NullLiteral),
  Identifier(Identifier),
  Array(ArrayExpression),
  Object(ObjectExpression),
  Call(CallExpression),
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ArgumentsList {
  index: u8,
  arguments: Option<Vec<Statement>>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct InputConfig {
  arguments_list: Vec<ArgumentsList>,
}

pub fn parse_json(json: &str) -> InputConfig {
  serde_json::from_str::<InputConfig>(&json).expect("Invalid json parse")
}

fn main() {
  let config = InputConfig {
    arguments_list: vec![ArgumentsList {
      index: 0,
      arguments: Some(vec![
        Statement::String(StringLiteral {
          value: "base".to_string(),
        }),
        Statement::Object(ObjectExpression {
          properties: vec![ObjectProperty {
            key: "".to_string(),
            value: Statement::String(StringLiteral {
              value: "".to_string(),
            }),
          }],
        }),
        Statement::Null(NullLiteral {}),
      ]),
    }],
  };
  let serialized = serde_json::to_string(&config).unwrap();
  println!("serialized = {}", serialized);
  let deserialized = parse_json(
    r#"{"argumentsList": [{"index": 0,"arguments":[{"type":"Null"},{"type":"String",value: ""}]}]}"#,
  );
  for args in deserialized.arguments_list.iter() {
    for arg in args.arguments.iter() {
      for statement in arg.iter() {
        match statement {
          Statement::String(_str) => {
            // _str.value;
          }
          Statement::Number(_num) => {
            // _num.value;
          }
          Statement::Boolean(_bool) => {
            // _bool.value
          }
          Statement::Null(_null) => {
            // obj.properties
          }
          Statement::Identifier(_identifier) => {
            // _identifier.name
          }
          Statement::Object(_obj) => {
            // _obj.properties
          }
          Statement::Array(_arr) => {
            // _arr.value
          }
          Statement::Call(_call) => {
            // _call.name
            // _call.arguments
          }
        }
      }
    }
  }
  println!("deserialized = {:?}", deserialized);
}
