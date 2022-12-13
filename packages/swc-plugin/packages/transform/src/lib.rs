use std::collections::BTreeMap;
use swc_core::{
  common::DUMMY_SP,
  ecma::{
    ast::{
      CallExpr, Callee, Expr, ExprOrSpread, Id, Ident, ImportDecl, ImportNamedSpecifier,
      ImportSpecifier, KeyValueProp, Lit, NewExpr, ObjectLit, Program, Prop, PropName,
      PropOrSpread, Str,
    },
    transforms::testing::test,
    visit::{as_folder, FoldWith, VisitMut, VisitMutWith},
  },
  plugin::{plugin_transform, proxies::TransformPluginProgramMetadata},
};

#[derive(serde::Deserialize)]
pub struct Style {
  index: u8,
  classes_object: Option<BTreeMap<String, BTreeMap<String, String>>>,
}

#[derive(serde::Deserialize)]
pub struct Config {
  styles: Vec<Style>,
}

pub fn json_to_config(json: Option<String>) -> Config {
  let config: Result<Config, serde_json::Error> = if let Some(config) = json {
    serde_json::from_str(&config)
  } else {
    panic!("config parse Error")
  };

  let config = match config {
    Ok(config) => config,
    Err(_) => panic!("config parse Error"),
  };
  config
}

pub struct Transform {
  from: String,
  to: String,
  import_id: Option<Id>,
}

pub struct TransformVisitor {
  config: Config,
  import_source: String,
  class_name: String,
  transforms: Vec<Transform>,
}

impl TransformVisitor {
  fn new(config: Config) -> Self {
    Self {
      config: config,
      import_source: "@kaze-style/react".to_string(),
      class_name: "ClassName".to_string(),
      transforms: vec![
        Transform {
          from: "__preStyle".to_string(),
          to: "__style".to_string(),
          import_id: None,
        },
        Transform {
          from: "__preGlobalStyle".to_string(),
          to: "__globalStyle".to_string(),
          import_id: None,
        },
      ],
    }
  }

  fn transform_target_import(&mut self, import_decl: &mut ImportDecl) {
    if &*import_decl.src.value == self.import_source {
      let mut is_target_import = false;
      for specifier in import_decl.specifiers.iter_mut() {
        match specifier {
          ImportSpecifier::Named(named_specifier) => {
            for transform in self.transforms.iter_mut() {
              if &transform.from == &*named_specifier.local.sym {
                let transform_to: &str = &transform.to;
                if is_target_import == false {
                  is_target_import = true;
                }
                transform.import_id = Some(named_specifier.local.to_id());
                named_specifier.local.sym = transform_to.into();
              }
            }
          }
          _ => {}
        }
      }
      if is_target_import {
        let class_name: &str = &self.class_name;
        let class_name = Ident {
          span: DUMMY_SP,
          optional: false,
          sym: class_name.into(),
        };
        import_decl
          .specifiers
          .push(ImportSpecifier::Named(ImportNamedSpecifier {
            local: class_name,
            is_type_only: false,
            imported: None,
            span: DUMMY_SP,
          }));
      }
    }
  }

  fn transform_target_call_ident(&mut self, call_expr: &mut CallExpr) {
    if let Callee::Expr(expr) = &mut call_expr.callee {
      if let Expr::Ident(ident) = &mut **expr {
        for transform in self.transforms.iter_mut() {
          if let Some(imported_id) = &transform.import_id {
            if &*ident.sym == &transform.from
              && *imported_id == ident.to_id()
              && call_expr.args.len() == 4
            {
              if let Expr::Lit(Lit::Num(index)) = &mut *call_expr.args[3].expr {
                let transform_to: &str = &transform.to;
                let class_name: &str = &self.class_name;
                let mut props: Vec<PropOrSpread> = vec![];

                for style in self.config.styles.iter() {
                  let style_index: f64 = style.index.into();
                  if index.value == style_index {
                    match &style.classes_object {
                      Some(classes_object) => {
                        for (classes_key, classes_value) in classes_object {
                          let classes_key: &str = classes_key;
                          let classes_arg = classes_value
                            .iter()
                            .map(|(style_key, style_value)| {
                              let style_key: &str = style_key;
                              let style_value: &str = style_value;
                              PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
                                key: PropName::Str(Str::from(style_key)),
                                value: Box::new(Expr::Lit(Lit::Str(Str::from(style_value)))),
                              })))
                            })
                            .collect();
                          props.push(PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
                            key: PropName::Str(Str::from(classes_key)),
                            value: Box::new(Expr::New(NewExpr {
                              span: DUMMY_SP,
                              args: Some(vec![ExprOrSpread {
                                expr: Box::new(Expr::Object(ObjectLit {
                                  props: classes_arg,
                                  span: DUMMY_SP,
                                })),
                                spread: None,
                              }]),
                              type_args: None,
                              callee: Box::new(Expr::Ident(Ident {
                                span: DUMMY_SP,
                                optional: false,
                                sym: class_name.into(),
                              })),
                            })),
                          }))));
                        }
                      }
                      _ => {}
                    }
                    break;
                  }
                }

                call_expr.args = vec![ExprOrSpread {
                  expr: Box::new(Expr::Object(ObjectLit {
                    span: DUMMY_SP,
                    props: props,
                  })),
                  spread: None,
                }];
                ident.sym = transform_to.into();
              }
            }
          }
        }
      }
    }
  }
}

impl VisitMut for TransformVisitor {
  fn visit_mut_import_decl(&mut self, import_decl: &mut ImportDecl) {
    self.transform_target_import(import_decl);
    import_decl.visit_mut_children_with(self);
  }

  fn visit_mut_call_expr(&mut self, call_expr: &mut CallExpr) {
    self.transform_target_call_ident(call_expr);
    call_expr.visit_mut_children_with(self);
  }
}

#[plugin_transform]
pub fn process_transform(program: Program, metadata: TransformPluginProgramMetadata) -> Program {
  let config = json_to_config(metadata.get_transform_plugin_config());
  program.fold_with(&mut as_folder(TransformVisitor::new(config)))
}

test!(
  Default::default(),
  |_| {
    as_folder(TransformVisitor::new(Config {
      styles: vec![Style {
        classes_object: Some(BTreeMap::from([
          (
            "base".to_string(),
            BTreeMap::from([("color".to_string(), "red".to_string())]),
          ),
          (
            "base1".to_string(),
            BTreeMap::from([("color".to_string(), "red".to_string())]),
          ),
        ])),
        index: 0,
      }],
    }))
  },
  test,
  // Input codes
  r#"
  import { __preStyle, __preGlobalStyle, mergeStyle } from '@kaze-style/react';
  const c = __preStyle({}, __forBuildByKazeStyle, "filename.ts", 0);
  __preGlobalStyle({}, __forBuildByKazeStyle, "filename.ts", 1);
  const c2 = __preStyle({}, __forBuildByKazeStyle, "filename.ts", 2);
  "#,
  // Output codes after
  r#"
  import { __style, __globalStyle, mergeStyle, ClassName } from '@kaze-style/react';
  const c = __style({
    "base": new ClassName({
      "color": "red"
    }),
    "base1": new ClassName({
      "color": "red"
    })
  });
  __globalStyle({});
  const c2 = __style({});
  "#
);
