mod config;
use config::{parse_config, InputConfig};

use swc_core::{
  common::{
    comments::{Comment, CommentKind, Comments},
    DUMMY_SP,
  },
  ecma::{
    ast::{
      ArrayLit, BindingIdent, CallExpr, Callee, Decl, ExportDecl, Expr, ExprOrSpread, Id, Ident,
      ImportSpecifier, Lit, MemberExpr, MemberProp, Module, ModuleDecl, ModuleExportName,
      ModuleItem, Number, Pat, Program, Stmt, VarDecl, VarDeclKind, VarDeclarator,
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
  name_space_ids: Vec<Id>,
}

pub struct TransformVisitor {
  target_index: u8,
  ident_index: u8,
  is_use_name_space: bool,
  is_transformed: bool,
  transformed_comment: String,
  comments: PluginCommentsProxy,
  transforms: Vec<Transform>,
  input_collector_export_name: String,
  collectors: Vec<Expr>,
  inject_argument: Expr,
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
        name_space_ids: vec![],
      })
      .collect::<Vec<Transform>>();
    Self {
      target_index: 0,
      ident_index: 0,
      collectors: vec![],
      is_use_name_space: false,
      is_transformed: false,
      comments: comments,
      transforms: transforms,
      transformed_comment: input_config.transformed_comment,
      input_collector_export_name: input_config.collector_export_name,
      inject_argument: node_to_expr(&input_config.inject_argument),
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
                    .name_space_ids
                    .iter()
                    .any(|name_space_id| match &*member_expr.obj {
                      Expr::Ident(member_obj_ident) => transform.ids.iter().any(|transform_id| {
                        if *name_space_id == member_obj_ident.to_id()
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
          expr: Box::new(self.inject_argument.clone()),
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

  fn target_name_space_import_extract_id(&mut self, member_expr: &mut MemberExpr) {
    if self.is_use_name_space == true {
      for transform in self.transforms.iter_mut() {
        for name_space_id in transform.name_space_ids.iter() {
          match &*member_expr.obj {
            Expr::Ident(expr_ident) => {
              if *name_space_id == expr_ident.to_id() {
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
        _ => {}
      }
    }
  }

  fn var_decl_extract_collector(&mut self, var_decl: &VarDecl) {
    for var_declarator in var_decl.decls.iter() {
      match &var_declarator.init {
        Some(init_expr) => match &**init_expr {
          Expr::Call(call_expr) => {
            for transform in self.transforms.iter() {
              if self.is_target_call_expr(&call_expr, transform) == true {
                match &var_declarator.name {
                  Pat::Ident(ident) => {
                    self.collectors.push(Expr::Ident(ident.id.clone()));
                  }
                  _ => {}
                }
              }
            }
          }
          _ => {}
        },
        None => {}
      }
    }
  }

  fn top_level_call_expr_extract_collector(&mut self, module_item: &mut ModuleItem) {
    match &module_item {
      ModuleItem::Stmt(stmt) => match stmt {
        Stmt::Expr(expr_stmt) => match &*expr_stmt.expr {
          Expr::Call(call_expr) => {
            for transform in self.transforms.iter() {
              if self.is_target_call_expr(call_expr, transform) == true {
                let ident = self.create_unique_ident();
                self.collectors.push(Expr::Ident(ident.clone()));
                self.ident_index += 1;
                *module_item = ModuleItem::Stmt(Stmt::Decl(Decl::Var(Box::new(VarDecl {
                  span: DUMMY_SP,
                  kind: VarDeclKind::Const,
                  declare: false,
                  decls: vec![VarDeclarator {
                    init: Some(Box::new(Expr::Call(call_expr.clone()))),
                    definite: false,
                    span: DUMMY_SP,
                    name: Pat::Ident(BindingIdent {
                      id: ident,
                      type_ann: None,
                    }),
                  }],
                }))));
                break;
              }
            }
          }
          _ => {}
        },
        _ => {}
      },
      ModuleItem::ModuleDecl(_) => {}
    }
  }

  fn create_unique_ident(&mut self) -> Ident {
    Ident {
      optional: false,
      span: DUMMY_SP,
      sym: format!("__{}", self.ident_index).clone().into(),
    }
  }

  fn add_collections(&mut self, module: &mut Module) {
    if self.collectors.len() != 0 {
      module
        .body
        .push(ModuleItem::ModuleDecl(ModuleDecl::ExportDecl(ExportDecl {
          span: DUMMY_SP,
          decl: Decl::Var(Box::new(VarDecl {
            span: DUMMY_SP,
            declare: false,
            kind: VarDeclKind::Const,
            decls: vec![VarDeclarator {
              span: DUMMY_SP,
              definite: false,
              init: Some(Box::new(Expr::Array(ArrayLit {
                span: DUMMY_SP,
                elems: self
                  .collectors
                  .iter()
                  .map(|collector| {
                    Some(ExprOrSpread {
                      spread: None,
                      expr: Box::new(collector.clone()),
                    })
                  })
                  .collect::<Vec<Option<ExprOrSpread>>>(),
              }))),
              name: Pat::Ident(BindingIdent {
                id: Ident {
                  optional: false,
                  span: DUMMY_SP,
                  sym: self.input_collector_export_name.clone().into(),
                },
                type_ann: None,
              }),
            }],
          })),
        })));
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
    self.target_name_space_import_extract_id(member_expr);
    member_expr.visit_mut_children_with(self);
  }

  fn visit_mut_call_expr(&mut self, call_expr: &mut CallExpr) {
    call_expr.visit_mut_children_with(self);
    self.set_call_expr_args(call_expr);
  }

  fn visit_mut_var_decl(&mut self, var_decl: &mut VarDecl) {
    var_decl.visit_mut_children_with(self);
    self.var_decl_extract_collector(var_decl);
  }

  fn visit_mut_module_item(&mut self, module_item: &mut ModuleItem) {
    module_item.visit_mut_children_with(self);
    self.top_level_call_expr_extract_collector(module_item);
  }

  fn visit_mut_module(&mut self, module: &mut Module) {
    self.target_imports_extract_id(module);
    module.visit_mut_children_with(self);
    self.add_collections(module);
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
        "injectArgument": {
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
              "key": "build",
              "value": {
                "type": "Identifier",
                "name": "for_build"
              },
            }
          ],
        },
        "collectorExportName": "__collector",
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
    const x0 = target({}, { "filename": "filename.ts", "build": for_build }, 0);
    const __0 = target({}, { "filename": "filename.ts", "build": for_build }, 1);
    export const __collector = [ x0, __0 ];
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
    const x0 = _target1({}, { "filename": "filename.ts", "build": for_build }, 0);
    const x1 = _target2({}, { "filename": "filename.ts", "build": for_build }, 1);
    export const __collector = [ x0, x1 ];
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
    const x0 = namespace0.target({}, { "filename": "filename.ts", "build": for_build }, 0);
    const x1 = namespace1.target({}, { "filename": "filename.ts", "build": for_build }, 1);
    export const __collector = [ x0, x1 ];
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
    const x0 = target({}, { "filename": "filename.ts", "build": for_build }, 0);
    const x1 = _target({}, { "filename": "filename.ts", "build": for_build }, 1);
    const x2 = __target({}, { "filename": "filename.ts", "build": for_build }, 2);
    const x3 = namespace.target({}, { "filename": "filename.ts", "build": for_build }, 3);
    const __0 = namespace.target({}, { "filename": "filename.ts", "build": for_build }, 4);
    const x4 = namespace.dummy({});
    export const __collector = [ x0, x1, x2, x3, __0 ];
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
    const x0 = target({}, { "filename": "filename.ts", "build": for_build }, 0);
    const x1 = _target({}, { "filename": "filename.ts", "build": for_build }, 1);
    const x2 = __target({}, { "filename": "filename.ts", "build": for_build }, 2);
    const x3 = namespace.target({}, { "filename": "filename.ts", "build": for_build }, 3);
    const __0 = namespace.target({}, { "filename": "filename.ts", "build": for_build }, 4);
    const x4 = namespace.dummy({});
    import { target, target as _target } from 'target_source';
    import { target as __target } from 'target_source';
    import * as namespace from 'target_source';
    export const __collector = [ x0, x1,  x2, x3, __0 ];
    "#
  );
}
