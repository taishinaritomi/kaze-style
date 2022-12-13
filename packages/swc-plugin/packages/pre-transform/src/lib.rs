use swc_core::{
  common::DUMMY_SP,
  ecma::{
    // atoms::{JsWord},
    ast::{
      CallExpr, Callee, Expr, ExprOrSpread, Id, Ident, ImportDecl, ImportSpecifier, Lit, Number,
      Program, Str,
    },
    transforms::testing::test,
    visit::{as_folder, FoldWith, VisitMut, VisitMutWith},
  },
  plugin::{plugin_transform, proxies::TransformPluginProgramMetadata},
};

#[derive(serde::Deserialize)]
pub struct Config {
  filename: String,
  for_build_name: String,
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
  index: u8,
  import_source: String,
  transforms: Vec<Transform>,
}

impl TransformVisitor {
  fn new(config: Config) -> Self {
    Self {
      config: config,
      index: 0,
      import_source: "@kaze-style/react".to_string(),
      transforms: vec![
        Transform {
          from: "createStyle".to_string(),
          to: "__preStyle".to_string(),
          import_id: None,
        },
        Transform {
          from: "createGlobalStyle".to_string(),
          to: "__preGlobalStyle".to_string(),
          import_id: None,
        },
      ],
    }
  }

  fn transform_target_import(&mut self, import_decl: &mut ImportDecl) {
    if &*import_decl.src.value == self.import_source {
      for specifier in import_decl.specifiers.iter_mut() {
        match specifier {
          ImportSpecifier::Named(named_specifier) => {
            for transform in self.transforms.iter_mut() {
              if &transform.from == &*named_specifier.local.sym {
                let to: &str = &transform.to;
                transform.import_id = Some(named_specifier.local.to_id());
                named_specifier.local.sym = to.into();
              }
            }
          }
          _ => {}
        }
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
              && call_expr.args.len() == 1
            {
              let to: &str = &transform.to;
              let filename: &str = &self.config.filename;
              let index: f64 = self.index.into();
              let for_build_name: &str = &self.config.for_build_name;
              let for_build_name = Ident {
                span: DUMMY_SP,
                optional: false,
                sym: for_build_name.into(),
              };
              ident.sym = to.into();
              call_expr.args.push(ExprOrSpread {
                expr: Box::new(Expr::Ident(for_build_name)),
                spread: None,
              });
              call_expr.args.push(ExprOrSpread {
                expr: Box::new(Expr::Lit(Lit::Str(Str::from(filename)))),
                spread: None,
              });
              call_expr.args.push(ExprOrSpread {
                expr: Box::new(Expr::Lit(Lit::Num(Number::from(index)))),
                spread: None,
              });
              self.index += 1;
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
  |_| as_folder(TransformVisitor::new(Config {
    filename: "filename.ts".to_string(),
    for_build_name: "for_build_name".to_string()
  })),
  test,
  // Input codes
  r#"
  import { createStyle, createGlobalStyle, mergeStyle } from '@kaze-style/react';
  const c = createStyle({});
  createGlobalStyle({});
  "#,
  // Output codes after
  r#"
  import { __preStyle, __preGlobalStyle, mergeStyle } from '@kaze-style/react';
  const c = __preStyle({}, for_build_name, "filename.ts", 0);
  __preGlobalStyle({}, for_build_name, "filename.ts", 1);
  "#
);
