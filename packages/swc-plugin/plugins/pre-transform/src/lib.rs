use swc_core::{
  common::{
    comments::{Comment, CommentKind, Comments},
    DUMMY_SP,
  },
  ecma::{
    ast::{
      CallExpr, Callee, Expr, ExprOrSpread, Id, Ident, ImportDecl, ImportSpecifier, Lit, Module,
      Number, Program, Str,
    },
    transforms::testing::test,
    visit::{as_folder, FoldWith, VisitMut, VisitMutWith},
  },
  plugin::{
    plugin_transform,
    proxies::{PluginCommentsProxy, TransformPluginProgramMetadata},
  },
};

#[derive(serde::Deserialize)]
pub struct Config {
  filename: String,
  #[serde(rename = "forBuildName")]
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
  comments: PluginCommentsProxy,
  index: u8,
  import_source: String,
  transformed_comment: String,
  is_transformed: bool,
  transforms: Vec<Transform>,
}

impl TransformVisitor {
  fn new(config: Config, comments: PluginCommentsProxy) -> Self {
    Self {
      config: config,
      comments: comments,
      index: 0,
      import_source: "@kaze-style/core".to_string(),
      transformed_comment: "__kaze-style-pre-transformed".to_string(),
      is_transformed: false,
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
                let transform_to: &str = &transform.to;
                transform.import_id = Some(named_specifier.local.to_id());
                named_specifier.local.sym = transform_to.into();
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
              let transform_to: &str = &transform.to;
              let filename: &str = &self.config.filename;
              let index: f64 = self.index.into();
              let for_build_name: &str = &self.config.for_build_name;
              let for_build_name = Ident {
                span: DUMMY_SP,
                optional: false,
                sym: for_build_name.into(),
              };
              ident.sym = transform_to.into();
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
              if self.is_transformed == false {
                self.is_transformed = true;
              }
            }
          }
        }
      }
    }
  }

  fn add_comment(&mut self, module: &mut Module) {
    if self.is_transformed {
      let transformed_comment: &str = &self.transformed_comment;
      self.comments.add_leading(
        module.span.lo,
        Comment {
          kind: CommentKind::Block,
          span: DUMMY_SP,
          text: transformed_comment.into(),
        },
      );
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
  fn visit_mut_module(&mut self, module: &mut Module) {
    module.visit_mut_children_with(self);
    self.add_comment(module);
  }
}

#[plugin_transform]
pub fn process_transform(program: Program, metadata: TransformPluginProgramMetadata) -> Program {
  let config = json_to_config(metadata.get_transform_plugin_config());
  program.fold_with(&mut as_folder(TransformVisitor::new(
    config,
    PluginCommentsProxy,
  )))
}

test!(
  Default::default(),
  |_| as_folder(TransformVisitor::new(
    Config {
      filename: "filename.ts".to_string(),
      for_build_name: "for_build_name".to_string()
    },
    PluginCommentsProxy
  )),
  test,
  // Input codes
  r#"
  import { createStyle, createGlobalStyle, mergeStyle } from '@kaze-style/core';
  const c = createStyle({});
  createGlobalStyle({});
  "#,
  // Output codes after
  r#"
  import { __preStyle, __preGlobalStyle, mergeStyle } from '@kaze-style/core';
  const c = __preStyle({}, for_build_name, "filename.ts", 0);
  __preGlobalStyle({}, for_build_name, "filename.ts", 1);
  "#
);
