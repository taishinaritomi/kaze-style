mod config;

use swc_core::{
  common::DUMMY_SP,
  ecma::{
    ast::{CallExpr, Callee, Expr, Ident, Program},
    transforms::testing::test,
    visit::{as_folder, FoldWith, VisitMut},
  },
  plugin::{plugin_transform, proxies::TransformPluginProgramMetadata},
};

use fxhash::FxHashMap;
use swc_core::ecma::ast::{ExprOrSpread, Id, ImportDecl, ImportNamedSpecifier, ImportSpecifier, Lit, ModuleExportName};
use crate::config::{Config, json_to_config};

pub struct TransformVisitor {
  config: Config,
  calls: FxHashMap<Id, String>,
  new_calls: FxHashMap<String, String>,
}

impl TransformVisitor {
  fn new(config: Config) -> Self {
    Self {
      config,
      calls: FxHashMap::default(),
      new_calls: FxHashMap::default(),
    }
  }
}

impl VisitMut for TransformVisitor {
  fn visit_mut_import_decl(&mut self, decl: &mut ImportDecl) {
    if decl.type_only {
      return;
    }

    for transform in self.config.transforms.iter() {
      if decl.src.value == transform.from.source {
        for specifier in decl.specifiers.iter_mut() {
          match specifier {
            // import { default as __style } from '@kaze-plugin/core'
            // import { __style } from '@kaze-plugin/core'
            ImportSpecifier::Named(named) => {
              let name = transform.from.specifier.as_ref();
              let matched = match &named.imported {
                Some(imported) => match imported {
                  ModuleExportName::Ident(v) => v.sym.to_string() == name,
                  ModuleExportName::Str(v) => v.value.to_string() == name,
                },
                _ => named.local.as_ref() == name,
              };
              if matched {
                // https://swc.rs/docs/plugin/ecmascript/cheatsheet#generateuididentifier
                self.calls.insert(named.local.to_id(), transform.to.specifier.clone());
                named.local.sym = transform.to.specifier.clone().into();
              }
            }

            // Todo: handle these?
            // import something from 'something'
            ImportSpecifier::Default(_) => {}
            // import * as namespace from 'something'
            ImportSpecifier::Namespace(_) => {}
          }
        }
      }
    }

    for import in self.config.imports.iter() {
      if decl.src.value == import.source {
        // Todo: only accept from imports that already exist? - change name from source to target?
        // Add new import to already existing import specifier

        // Local
        let local = Ident::new(import.specifier.clone().into(), DUMMY_SP);
        let local_name = local.to_string();
        let imported = Ident::new(import.specifier.clone().into(), DUMMY_SP);
        // todo: make sure to update the name we're interested in
        let imported_name = imported.to_string();
        let specifier = ImportSpecifier::Named(ImportNamedSpecifier {
          span: DUMMY_SP,
          local,
          imported: Some(ModuleExportName::Ident(imported)),
          is_type_only: false,
        });

        decl.specifiers.push(specifier);
        self.new_calls.insert(local_name, imported_name);
      }
    }
  }

  fn visit_mut_call_expr(&mut self, expr: &mut CallExpr) {
    if self.calls.is_empty() {
      return;
    }

    if let Callee::Expr(callee) = &expr.callee {
      if let Expr::Ident(ident) = &**callee {
        if let Some(to_name) = self.calls.get(&ident.to_id()) {
          expr.callee = Callee::Expr(Box::new(Expr::Ident(Ident::new(
            to_name.clone().into(),
            DUMMY_SP,
          ))));

          let mut new_args = vec![];

          if expr.args.len() == 4 {
            if let Expr::Lit(Lit::Num(index)) = &mut *expr.args[3].expr {
              for style in self.config.styles.iter() {
                // Todo: is this check really needed? Why are we keeping track of the index?
                if index.value == style.index {
                  new_args = style.arguments.iter().map(|v| ExprOrSpread {
                    spread: None,
                    expr: Box::new(v.clone()),
                  }).collect();
                }
              }
            }
          }

          expr.args = new_args;
        }
      }
    }
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
      },
      {
        "from": {
          "specifier": "__preGlobalStyle",
          "source": "@kaze-style/core"
        },
        "to": {
          "specifier": "__globalStyle",
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
                    "key": "color",
                    "value": {
                      "kind": 0,
                      "value": "red"
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
                      "key": "color",
                      "value": {
                        "kind": 0,
                        "value": "red"
                      }
                    },
                    {
                      "kind": 6,
                      "key": "fontSize",
                      "value": {
                        "kind": 0,
                        "value": "12px"
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

    as_folder(TransformVisitor::new(json_to_config(Some(config.into()))))
  },
  test,
  // Input
  r#"
    import { __preStyle, __preGlobalStyle } from "@kaze-style/core";
    __preGlobalStyle({});
    __preStyle({}, null, null, 0);
    notTouched();
  "#,
  // Output
  r#"
    import { __style, __globalStyle, ClassName as ClassName } from "@kaze-style/core";
    __globalStyle();
    __style({
      container: "_11s457t",
      $button: new ClassName({
          color: "red"
      }),
      $blueButton: new ClassName({
          color: "red",
          fontSize: "12px"
      })
    });
    notTouched();
  "#
);
