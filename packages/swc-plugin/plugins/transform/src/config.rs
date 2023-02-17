use serde::{Deserialize, Serialize};
use serde_repr::*;
use swc_core::common::DUMMY_SP;
use swc_core::ecma::ast::{Expr, ExprOrSpread, Ident, KeyValueProp, Lit, NewExpr, ObjectLit, Prop, PropName, PropOrSpread, Str};

#[derive(Debug, Serialize_repr, Deserialize_repr)]
#[repr(u8)]
enum SerializedKind {
  String = 0,
  // Todo
  Null = 1,
  // Todo
  Number = 2,
  // Todo
  Boolean = 3,
  Array = 4,
  ObjectExpression = 5,
  ObjectProperty = 6,
  Custom = 7,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(untagged)]
pub enum SerializedValues {
  SerializedString(SerializedString),
  SerializedObjectProperty(SerializedObjectProperty),
  SerializedObject(SerializedObject),
  SerializedCustom(SerializedCustom),
  SerializedArray(SerializedArray),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SerializedArray {
  kind: SerializedKind,
  value: Vec<SerializedValues>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SerializedObject {
  kind: SerializedKind,
  value: Box<Vec<SerializedObjectProperty>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SerializedObjectProperty {
  kind: SerializedKind,
  key: String,
  value: Box<SerializedValues>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SerializedString {
  kind: SerializedKind,
  value: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SerializedCustom {
  kind: SerializedKind,
  constructor: String,
  value: Box<SerializedValues>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ImportSpecifier {
  pub specifier: String,
  pub source: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InputStyle {
  index: f64,
  arguments: Vec<SerializedValues>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InputConfig {
  transforms: Vec<Transform>,
  imports: Vec<ImportSpecifier>,
  styles: Vec<InputStyle>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Transform {
  pub from: ImportSpecifier,
  pub to: ImportSpecifier,
}

#[derive(Debug)]
pub struct Style {
  pub index: f64,
  pub arguments: Vec<Expr>,
}

#[derive(Debug)]
pub struct Config {
  pub transforms: Vec<Transform>,
  pub imports: Vec<ImportSpecifier>,
  pub styles: Vec<Style>,
}

// Todo: it's possible that we can use actual json AST to do this - we'll have to investigate SWC more
pub fn value_to_expr(value: &SerializedValues) -> Expr {
  match value {
    SerializedValues::SerializedString(string) => {
      Expr::Lit(Lit::Str(Str {
        value: string.value.clone().into(),
        span: DUMMY_SP,
        raw: None,
      }))
    }
    SerializedValues::SerializedObject(object) => {
      let mut properties = vec![];

      for x in object.value.iter() {
        let key = PropName::Ident(Ident::new(x.key.clone().into(), DUMMY_SP));
        let value = value_to_expr(&x.value);

        let prop = PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
          key,
          value: Box::new(value),
        })));

        properties.push(prop);
      }

      Expr::Object(ObjectLit {
        span: DUMMY_SP,
        props: properties,
      })
    }
    SerializedValues::SerializedCustom(custom) => {
      // todo: we should check for to see if we have safe identifier
      let constructor = Ident::new(custom.constructor.clone().into(), DUMMY_SP);
      let value = value_to_expr(&custom.value);

      Expr::New(NewExpr {
        span: DUMMY_SP,
        callee: Box::new(Expr::Ident(constructor)),
        args: Some(vec![ExprOrSpread {
          spread: None,
          expr: Box::new(value),
        }]),
        type_args: None,
      })
    }
    _ => unimplemented!(),
  }
}

pub fn json_to_config(json: Option<String>) -> Config {
  let config: Result<InputConfig, serde_json::Error> = if let Some(config) = json {
    serde_json::from_str(&config)
  } else {
    panic!("config parse Error")
  };

  let config = match config {
    Ok(config) => config,
    Err(_) => panic!("config parse Error"),
  };

  let styles = config.styles
    .iter()
    .map(|style| {
      Style {
        index: style.index,
        arguments: style.arguments
          .iter()
          .map(|argument| value_to_expr(argument))
          .collect::<Vec<Expr>>()
      }
    }).collect::<Vec<Style>>();

  Config {
    transforms: config.transforms,
    imports: config.imports,
    styles,
  }
}

#[test]
fn serde2() {
  let config = r#"
    {
      "transforms": [{
        "from": {
          "specifier": "__preStyle",
          "source": "@kaze-style/core"
        },
        "to": {
          "specifier": "__style",
          "source": "@kaze-style/core"
        }
      }],
      "imports": [{
        "specifier": "ClassName",
        "source": "@kaze-style/core"
      }],
      "styles": [{
        "index": 0,
        "arguments": [{
          "kind": 5,
          "value": [{
              "kind": 6,
              "key": "container",
              "value": {
                "kind": 0,
                "value": "_11s457t"
              }
            },
            {
              "kind": 6,
              "key": "$button",
              "value": {
                "kind": 7,
                "constructor": "ClassName",
                "value": {
                  "kind": 5,
                  "value": [{
                    "kind": 6,
                    "key": "_xy62pb",
                    "value": {
                      "kind": 0,
                      "value": "_1ioqvwq"
                    }
                  }]
                }
              }
            },
            {
              "kind": 6,
              "key": "$blueButton",
              "value": {
                "kind": 7,
                "constructor": "ClassName",
                "value": {
                  "kind": 5,
                  "value": [{
                      "kind": 6,
                      "key": "_t7zwuo",
                      "value": {
                        "kind": 0,
                        "value": "_1q6qasc"
                      }
                    },
                    {
                      "kind": 6,
                      "key": "_5rb1nc",
                      "value": {
                        "kind": 0,
                        "value": "_qq53s5"
                      }
                    }
                  ]
                }
              }
            }
          ]
        }]
      }]
    }
  "#;

  let config = json_to_config(Some(config.into()));
  println!("{:#?}", config);
}
