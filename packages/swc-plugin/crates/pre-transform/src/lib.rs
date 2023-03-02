mod config;
use config::{parse_config, InputConfig};

use swc_core::{
  common::{
    comments::{Comment, CommentKind, Comments},
    DUMMY_SP,
  },
  ecma::{
    ast::{
      CallExpr, Callee, Expr, ExprOrSpread, Id, Ident, ImportSpecifier, Lit, MemberExpr,
      MemberProp, Module, ModuleDecl, ModuleExportName, ModuleItem, Number, Program,
    },
    visit::{as_folder, FoldWith, VisitMut, VisitMutWith},
  },
  plugin::{
    plugin_transform,
    proxies::{PluginCommentsProxy, TransformPluginProgramMetadata},
  },
};

use helper::ast_node::node_to_expr;

pub struct Transform {
  from: String,
  import_source: String,
  ids: Vec<Id>,
  namespace_ids: Vec<Id>,
}

pub struct TransformVisitor {
  target_index: usize,
  is_use_namespace: bool,
  is_transformed: bool,
  transformed_comment: String,
  comments: PluginCommentsProxy,
  transforms: Vec<Transform>,
  build_arg: Expr,
}

impl TransformVisitor {
  fn new(input_config: InputConfig, comments: PluginCommentsProxy) -> Self {
    let transforms = input_config
      .transforms
      .iter()
      .map(|input_transform| Transform {
        from: input_transform.from.to_string(),
        import_source: input_transform.source.to_string(),
        ids: vec![],
        namespace_ids: vec![],
      })
      .collect::<Vec<Transform>>();
    Self {
      target_index: 0,
      is_use_namespace: false,
      is_transformed: false,
      comments: comments,
      transforms: transforms,
      transformed_comment: input_config.transformed_comment,
      build_arg: node_to_expr(&input_config.build_arg),
    }
  }

  fn is_target_call_expr(&self, call_expr: &CallExpr, transform: &Transform) -> bool {
    let mut is_target = false;
    match &call_expr.callee {
      Callee::Expr(callee_expr) => {
        let callee_expr = &**callee_expr;
        match callee_expr {
          Expr::Ident(callee_ident) => {
            let callee_ident_is_target = transform
              .ids
              .iter()
              .any(|transform_id| *transform_id == callee_ident.to_id());
            is_target = callee_ident_is_target;
          }
          Expr::Member(member_expr) => {
            match &member_expr.prop {
              MemberProp::Ident(member_ident) => {
                let member_ident_is_target =
                  transform
                    .namespace_ids
                    .iter()
                    .any(|namespace_id| match &*member_expr.obj {
                      Expr::Ident(member_obj_ident) => transform.ids.iter().any(|transform_id| {
                        if *namespace_id == member_obj_ident.to_id()
                          && *transform_id == member_ident.to_id()
                        {
                          true
                        } else {
                          false
                        }
                      }),
                      _ => false,
                    });
                is_target = member_ident_is_target;
              }
              _ => {}
            };
          }
          _ => {}
        };
      }
      _ => {}
    }
    return is_target.clone();
  }

  fn set_call_expr_args(&mut self, call_expr: &mut CallExpr) {
    for transform in self.transforms.iter() {
      let is_target = self.is_target_call_expr(call_expr, transform);
      if is_target == true {
        call_expr.args.push(ExprOrSpread {
          spread: None,
          expr: Box::new(self.build_arg.clone()),
        });
        call_expr.args.push(ExprOrSpread {
          expr: Box::new(Expr::Lit(Lit::Num(Number::from(self.target_index as f64)))),
          spread: None,
        });
        self.target_index += 1;
        if self.is_transformed == false {
          self.is_transformed = true;
        }
      }
    }
  }

  fn target_namespace_import_extract_id(&mut self, member_expr: &mut MemberExpr) {
    if self.is_use_namespace == true {
      for transform in self.transforms.iter_mut() {
        for namespace_id in transform.namespace_ids.iter() {
          match &*member_expr.obj {
            Expr::Ident(expr_ident) => {
              if *namespace_id == expr_ident.to_id() {
                match &mut member_expr.prop {
                  MemberProp::Ident(prop_ident) => {
                    if prop_ident.sym == transform.from {
                      transform.ids.push(prop_ident.to_id());
                    }
                  }
                  _ => {}
                }
              }
            }
            _ => {}
          }
        }
      }
    }
  }

  fn target_imports_extract_id(&mut self, module: &mut Module) {
    for module_item in module.body.iter_mut() {
      match module_item {
        ModuleItem::ModuleDecl(ModuleDecl::Import(import_decl)) => {
          if import_decl.type_only {
            return;
          }
          for transform in self.transforms.iter_mut() {
            if &*import_decl.src.value == transform.import_source {
              for import_specifier in import_decl.specifiers.iter_mut() {
                match import_specifier {
                  ImportSpecifier::Named(import_named) => {
                    let import_ident: Option<&Ident> = match &import_named.imported {
                      Some(import_named_imported) => {
                        match import_named_imported {
                          // import { named as _named } from ''
                          ModuleExportName::Ident(imported_ident) => Some(imported_ident),
                          // import { "named" as _named } from '' ???
                          ModuleExportName::Str(_) => None,
                        }
                      }
                      // import { named } from ''
                      None => Some(&import_named.local),
                    };
                    match import_ident {
                      Some(import_ident) => {
                        if import_ident.sym.to_string() == transform.from {
                          transform.ids.push(import_named.local.to_id());
                        }
                      }
                      None => {}
                    };
                  }
                  // import default from ''
                  ImportSpecifier::Default(_) => {}
                  // import * as namespace from ''
                  ImportSpecifier::Namespace(namespace) => {
                    transform.namespace_ids.push(namespace.local.to_id());
                    if self.is_use_namespace == false {
                      self.is_use_namespace = true;
                    }
                  }
                }
              }
            }
          }
        }
        _ => {}
      }
    }
  }

  fn add_transformed_comment(&mut self, module: &mut Module) {
    if self.is_transformed == true {
      self.comments.add_leading(
        module.span.lo,
        Comment {
          kind: CommentKind::Block,
          span: DUMMY_SP,
          text: self.transformed_comment.clone().into(),
        },
      );
    }
  }
}

impl VisitMut for TransformVisitor {
  fn visit_mut_member_expr(&mut self, member_expr: &mut MemberExpr) {
    self.target_namespace_import_extract_id(member_expr);
    member_expr.visit_mut_children_with(self);
  }

  fn visit_mut_call_expr(&mut self, call_expr: &mut CallExpr) {
    call_expr.visit_mut_children_with(self);
    self.set_call_expr_args(call_expr);
  }

  fn visit_mut_module(&mut self, module: &mut Module) {
    self.target_imports_extract_id(module);
    module.visit_mut_children_with(self);
    self.add_transformed_comment(module);
  }
}

#[plugin_transform]
pub fn process_transform(program: Program, metadata: TransformPluginProgramMetadata) -> Program {
  let config = parse_config(&metadata.get_transform_plugin_config().expect(""));
  program.fold_with(&mut as_folder(TransformVisitor::new(
    config,
    PluginCommentsProxy,
  )))
}

#[cfg(test)]
mod tests {
  use super::config::{parse_config, InputConfig};
  use crate::TransformVisitor;
  use serde_json::json;
  use swc_core::{
    ecma::{transforms::testing::test, visit::as_folder},
    plugin::proxies::PluginCommentsProxy,
  };

  fn get_config() -> InputConfig {
    let config_json = json!({
        "transforms": [
          {
            "source": "target_source",
            "from": "target",
            "to": "__target"
          },
        ],
        "buildArg": {
          "type": "Object",
          "properties": [
            {
              "key": "filename",
              "value": {
                "type": "String",
                "value": "filename.ts"
              },
            },
            {
              "key": "injector",
              "value": {
                "type": "Identifier",
                "name": "injector"
              },
            }
          ],
        },
        "transformedComment": "transformedComment"
    })
    .to_string();
    parse_config(&config_json)
  }
  test!(
    Default::default(),
    |_| as_folder(TransformVisitor::new(get_config(), PluginCommentsProxy)),
    basic,
    // Input codes
    r#"
    import { target } from 'target_source';
    const x0 = target({});
    target({});
    "#,
    // Output codes after
    r#"
    import { target } from 'target_source';
    const x0 = target({}, { "filename": "filename.ts", "injector": injector }, 0);
    target({}, { "filename": "filename.ts", "injector": injector }, 1);
    "#
  );

  test!(
    Default::default(),
    |_| as_folder(TransformVisitor::new(get_config(), PluginCommentsProxy)),
    as_basic,
    // Input codes
    r#"
    import { target as _target1 } from 'target_source';
    import { target as _target2 } from 'target_source';
    const x0 = _target1({});
    const x1 = _target2({});
    "#,
    // Output codes after
    r#"
    import { target as _target1 } from 'target_source';
    import { target as _target2 } from 'target_source';
    const x0 = _target1({}, { "filename": "filename.ts", "injector": injector }, 0);
    const x1 = _target2({}, { "filename": "filename.ts", "injector": injector }, 1);
    "#
  );

  test!(
    Default::default(),
    |_| as_folder(TransformVisitor::new(get_config(), PluginCommentsProxy)),
    namespace,
    // Input codes
    r#"
    import * as namespace0 from 'target_source';
    import * as namespace1 from 'target_source';
    const x0 = namespace0.target({});
    const x1 = namespace1.target({});
    "#,
    // Output codes after
    r#"
    import * as namespace0 from 'target_source';
    import * as namespace1 from 'target_source';
    const x0 = namespace0.target({}, { "filename": "filename.ts", "injector": injector }, 0);
    const x1 = namespace1.target({}, { "filename": "filename.ts", "injector": injector }, 1);
    "#
  );
  test!(
    Default::default(),
    |_| as_folder(TransformVisitor::new(get_config(), PluginCommentsProxy)),
    mix,
    // Input codes
    r#"
    import { target, target as _target } from 'target_source';
    import { target as __target } from 'target_source';
    import * as namespace from 'target_source';
    const x0 = target({});
    const x1 = _target({});
    const x2 = __target({});
    const x3 = namespace.target({});
    namespace.target({});
    const x4 = namespace.dummy({});
    "#,
    // Output codes after
    r#"
    import { target, target as _target } from 'target_source';
    import { target as __target } from 'target_source';
    import * as namespace from 'target_source';
    const x0 = target({}, { "filename": "filename.ts", "injector": injector }, 0);
    const x1 = _target({}, { "filename": "filename.ts", "injector": injector }, 1);
    const x2 = __target({}, { "filename": "filename.ts", "injector": injector }, 2);
    const x3 = namespace.target({}, { "filename": "filename.ts", "injector": injector }, 3);
    namespace.target({}, { "filename": "filename.ts", "injector": injector }, 4);
    const x4 = namespace.dummy({});
    "#
  );
  test!(
    Default::default(),
    |_| as_folder(TransformVisitor::new(get_config(), PluginCommentsProxy)),
    last_import_mix,
    // Input codes
    r#"
    const x0 = target({});
    const x1 = _target({});
    const x2 = __target({});
    const x3 = namespace.target({});
    namespace.target({});
    const x4 = namespace.dummy({});
    import { target, target as _target } from 'target_source';
    import { target as __target } from 'target_source';
    import * as namespace from 'target_source';
    "#,
    // Output codes after
    r#"
    const x0 = target({}, { "filename": "filename.ts", "injector": injector }, 0);
    const x1 = _target({}, { "filename": "filename.ts", "injector": injector }, 1);
    const x2 = __target({}, { "filename": "filename.ts", "injector": injector }, 2);
    const x3 = namespace.target({}, { "filename": "filename.ts", "injector": injector }, 3);
    namespace.target({}, { "filename": "filename.ts", "injector": injector }, 4);
    const x4 = namespace.dummy({});
    import { target, target as _target } from 'target_source';
    import { target as __target } from 'target_source';
    import * as namespace from 'target_source';
    "#
  );
}
