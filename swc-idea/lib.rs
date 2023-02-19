use swc_core::ecma::ast::{
  CallExpr, Callee, Expr, Id, MemberExpr, MemberProp, Module, ModuleDecl, ModuleItem, ExprOrSpread, Lit, Str,
};
use swc_core::plugin::{plugin_transform, proxies::TransformPluginProgramMetadata};
use swc_core::{
  common::DUMMY_SP,
  ecma::{
    ast::{Ident, ImportDecl, ImportSpecifier, ModuleExportName, Program},
    visit::{as_folder, FoldWith, VisitMut, VisitMutWith},
  },
};

pub struct Transform {
  from: String,
  to: String,
  import_source: String,
  ids: Vec<Id>,
  name_space_ids: Vec<Id>,
}

pub struct TransformVisitor {
  is_use_name_space: bool,
  transforms: Vec<Transform>,
}

impl TransformVisitor {
  fn new() -> Self {
    Self {
      is_use_name_space: false,
      transforms: vec![
        Transform {
          from: "target".to_string(),
          to: "newTarget".to_string(),
          import_source: "target_import".to_string(),
          ids: vec![],
          name_space_ids: vec![],
        },
        Transform {
          from: "target2".to_string(),
          to: "newTarget2".to_string(),
          import_source: "target_import".to_string(),
          ids: vec![],
          name_space_ids: vec![],
        },
      ],
    }
  }
  fn transform_import(&mut self, import_decl: &mut ImportDecl) {
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
                    import_named.imported = Some(ModuleExportName::Ident(Ident {
                      optional: false,
                      span: DUMMY_SP,
                      sym: (&transform.to as &str).into(),
                    }));
                  }
                }
                None => {}
              };
            }
            // import default from ''
            ImportSpecifier::Default(_) => {}
            // import * as namespace from ''
            ImportSpecifier::Namespace(namespace) => {
              transform.name_space_ids.push(namespace.local.to_id());
              if self.is_use_name_space == false {
                self.is_use_name_space = true;
              }
            }
          }
        }
      }
    }
  }

  fn transform_name_space(&mut self, member_expr: &mut MemberExpr) {
    if self.is_use_name_space == true {
      for transform in self.transforms.iter_mut() {
        for name_space_id in transform.name_space_ids.iter() {
          match &*member_expr.obj {
            Expr::Ident(expr_ident) => {
              if *name_space_id == expr_ident.to_id() {
                match &mut member_expr.prop {
                  MemberProp::Ident(prop_ident) => {
                    if prop_ident.sym == transform.from {
                      prop_ident.sym = (&transform.to as &str).into();
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

  fn transform_call_expr(&mut self, call_expr: &mut CallExpr) {
    for transform in self.transforms.iter() {
      match &call_expr.callee {
        Callee::Expr(callee_expr) => {
          let callee_expr = &**callee_expr;
          let is_target = match callee_expr {
            Expr::Ident(callee_ident) => {
              transform.ids.iter().any(|transform_id| *transform_id == callee_ident.to_id())
            }
            Expr::Member(member_expr) => match &member_expr.prop {
              MemberProp::Ident(member_ident) => {
                transform.name_space_ids.iter().any(|name_space_id| {
                  match &*member_expr.obj {
                    Expr::Ident(member_obj_ident) => {
                      transform.ids.iter().any(|transform_id| {
                        if *name_space_id == member_obj_ident.to_id()
                        && *transform_id == member_ident.to_id()
                        {
                          true
                        } else {
                          false
                        }
                      })
                    }
                    _ => false,
                  }
                })
              }
              _ => false,
            },
            _ => false,
          };
          if is_target == true {
            call_expr.args.push(ExprOrSpread {
              spread: None,
              expr: Box::new(Expr::Lit(Lit::Str(Str {
                raw: None,
                span: DUMMY_SP,
                value: "12345".into(),
              })))
            });
          }
        }
        _ => {}
      }
      // transform
    }
  }
}

impl VisitMut for TransformVisitor {
  // fn visit_mut_import_decl(&mut self, import_decl: &mut ImportDecl) {
  // self.transform_import(import_decl);
  //   import_decl.visit_mut_children_with(self);
  // }
  fn visit_mut_member_expr(&mut self, member_expr: &mut MemberExpr) {
    self.transform_name_space(member_expr);
    member_expr.visit_mut_children_with(self);
  }
  fn visit_mut_call_expr(&mut self, call_expr: &mut CallExpr) {
    call_expr.visit_mut_children_with(self);
    self.transform_call_expr(call_expr);
  }
  fn visit_mut_module(&mut self, module: &mut Module) {
    for module_item in module.body.iter_mut() {
      match module_item {
        ModuleItem::ModuleDecl(ModuleDecl::Import(import_decl)) => {
          self.transform_import(import_decl);
        }
        _ => {}
      }
    }
    module.visit_mut_children_with(self);
  }
}

#[plugin_transform]
pub fn process_transform(program: Program, _metadata: TransformPluginProgramMetadata) -> Program {
  program.fold_with(&mut as_folder(TransformVisitor::new()))
}

#[cfg(test)]
mod tests {
  // use super::*;
  use swc_core::ecma::{transforms::testing::test, visit::as_folder};

  use crate::TransformVisitor;

  test!(
    Default::default(),
    |_| as_folder(TransformVisitor::new()),
    basic,
    // Input codes
    r#"
    import { target } from 'target_import';
    const x1 = target({});
    "#,
    // Output codes after
    r#"
    import { newTarget as target } from 'target_import';
    const x1 = target({});
    "#
  );

  test!(
    Default::default(),
    |_| as_folder(TransformVisitor::new()),
    as_basic,
    // Input codes
    r#"
    import { target as _target1 } from 'target_import';
    import { target as _target2 } from 'target_import';
    const x1 = _target1({});
    const x2 = _target2({});
    "#,
    // Output codes after
    r#"
    import { newTarget as _target1 } from 'target_import';
    import { newTarget as _target2 } from 'target_import';
    const x1 = _target1({});
    const x2 = _target2({});
    "#
  );

  test!(
    Default::default(),
    |_| as_folder(TransformVisitor::new()),
    namespace,
    // Input codes
    r#"
    import * as namespace1 from 'target_import';
    import * as namespace2 from 'target_import';
    const x1 = namespace1.target({});
    const x2 = namespace2.target({});
    "#,
    // Output codes after
    r#"
    import * as namespace1 from 'target_import';
    import * as namespace2 from 'target_import';
    const x1 = namespace1.newTarget({});
    const x2 = namespace2.newTarget({});
    "#
  );
  test!(
    Default::default(),
    |_| as_folder(TransformVisitor::new()),
    mix,
    // Input codes
    r#"
    import { target, target as _target } from 'target_import';
    import { target as __target } from 'target_import';
    import * as namespace from 'target_import';
    const x1 = target({});
    const x2 = _target({});
    const x3 = __target({});
    const x4 = namespace.target({});
    const x5 = namespace.dummy({});
    "#,
    // Output codes after
    r#"
    import { newTarget as target, newTarget as _target } from 'target_import';
    import { newTarget as __target } from 'target_import';
    import * as namespace from 'target_import';
    const x1 = target({});
    const x2 = _target({});
    const x3 = __target({});
    const x4 = namespace.newTarget({});
    const x5 = namespace.dummy({});
    "#
  );
  test!(
    Default::default(),
    |_| as_folder(TransformVisitor::new()),
    last_import_mix,
    // Input codes
    r#"
    const x1 = target({});
    const x2 = _target({});
    const x3 = __target({});
    const x4 = namespace.target({});
    const x5 = namespace.dummy({});
    import { target, target as _target } from 'target_import';
    import { target as __target } from 'target_import';
    import * as namespace from 'target_import';
    "#,
    // Output codes after
    r#"
    const x1 = target({});
    const x2 = _target({});
    const x3 = __target({});
    const x4 = namespace.newTarget({});
    const x5 = namespace.dummy({});
    import { newTarget as target, newTarget as _target } from 'target_import';
    import { newTarget as __target } from 'target_import';
    import * as namespace from 'target_import';
    "#
  );
}
