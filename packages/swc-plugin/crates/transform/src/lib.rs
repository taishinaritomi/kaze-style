mod config;
use config::{parse_config, InputConfig};

use swc_core::{
  common::DUMMY_SP,
  ecma::{
    ast::{
      CallExpr, Callee, Expr, ExprOrSpread, Id, Ident, ImportDecl, ImportNamedSpecifier,
      ImportSpecifier, Lit, MemberExpr, MemberProp, Module, ModuleDecl, ModuleExportName,
      ModuleItem, Program, Str, VarDecl,
    },
    visit::{as_folder, FoldWith, VisitMut, VisitMutWith},
  },
  plugin::{plugin_transform, proxies::TransformPluginProgramMetadata},
};

use helper::ast_node::node_to_expr;
use helper::common_config::InputImport;

pub struct Transform {
  from: String,
  to: String,
  import_source: String,
  ids: Vec<Id>,
  name_space_ids: Vec<Id>,
}

pub struct TransformVisitor {
  // target_index: usize,
  // ident_index: usize,
  is_use_name_space: bool,
  transforms: Vec<Transform>,
  input_imports: Vec<InputImport>,
  inject_arguments: Vec<ArgumentExpr>,
}
pub struct ArgumentExpr {
  value: Vec<ExprOrSpread>,
  index: usize,
}

impl TransformVisitor {
  fn new(input_config: InputConfig) -> Self {
    let transforms = input_config
      .transforms
      .iter()
      .map(|input_transform| Transform {
        from: input_transform.from.to_string(),
        to: input_transform.to.to_string(),
        import_source: input_transform.source.to_string(),
        ids: vec![],
        name_space_ids: vec![],
      })
      .collect::<Vec<Transform>>();
    let inject_arguments = input_config
      .inject_arguments
      .iter()
      .map(|inject_argument| ArgumentExpr {
        index: inject_argument.index,
        value: inject_argument
          .value
          .iter()
          .map(|argument| ExprOrSpread {
            expr: Box::new(node_to_expr(argument)),
            spread: None,
          })
          .collect::<Vec<ExprOrSpread>>(),
      })
      .collect::<Vec<ArgumentExpr>>();
    Self {
      // target_index: 0,
      // ident_index: 0,
      is_use_name_space: false,
      transforms: transforms,
      input_imports: input_config.imports,
      inject_arguments: inject_arguments,
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

  fn transform_call_expr_args(&mut self, call_expr: &mut CallExpr) {
    for transform in self.transforms.iter() {
      let is_target = self.is_target_call_expr(call_expr, transform);
      if is_target == true {
        let last_argument = call_expr.args.last();
        match last_argument {
          Some(last_argument) => {
            let argument_index = self.get_index_number(&*last_argument.expr);
            match argument_index {
              Some(argument_index) => {
                let mut is_transform = false;
                for inject_argument in self.inject_arguments.iter() {
                  if (inject_argument.index as f64) == argument_index {
                    call_expr.args = inject_argument.value.clone();
                    is_transform = true;
                    break;
                  }
                }
                if is_transform == false {
                  call_expr.args = vec![];
                }
              }
              None => {
                call_expr.args = vec![];
              }
            }
          }
          None => {
            call_expr.args = vec![];
          }
        }
        // call_expr.args =
        // call_expr.args.push(ExprOrSpread {
        //   spread: None,
        //   expr: Box::new(self.inject_arguments.clone()),
        // });
        // call_expr.args.push(ExprOrSpread {
        //   expr: Box::new(Expr::Lit(Lit::Num(Number::from(self.target_index as f64)))),
        //   spread: None,
        // });
        // self.target_index += 1;
      }
    }
  }

  fn get_index_number(&self, expr: &Expr) -> Option<f64> {
    if let Expr::Lit(Lit::Num(index)) = &expr {
      Some(index.value)
    } else {
      None
    }
  }

  fn transform_name_space_import_ident(&mut self, member_expr: &mut MemberExpr) {
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

  fn transform_imports(&mut self, module: &mut Module) {
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
        _ => {}
      }
    }
  }

  // fn var_decl_extract_collector(&mut self, var_decl: &VarDecl) {
  //   for var_declarator in var_decl.decls.iter() {
  //     match &var_declarator.init {
  //       Some(init_expr) => match &**init_expr {
  //         Expr::Call(call_expr) => {
  //           for transform in self.transforms.iter() {
  //             if self.is_target_call_expr(&call_expr, transform) == true {
  //               match &var_declarator.name {
  //                 Pat::Ident(ident) => {
  //                   self.collectors.push(Expr::Ident(ident.id.clone()));
  //                 }
  //                 _ => {}
  //               }
  //             }
  //           }
  //         }
  //         _ => {}
  //       },
  //       None => {}
  //     }
  //   }
  // }

  // fn top_level_call_expr_extract_collector(&mut self, module_item: &mut ModuleItem) {
  //   match &module_item {
  //     ModuleItem::Stmt(stmt) => match stmt {
  //       Stmt::Expr(expr_stmt) => match &*expr_stmt.expr {
  //         Expr::Call(call_expr) => {
  //           for transform in self.transforms.iter() {
  //             if self.is_target_call_expr(call_expr, transform) == true {
  //               let ident = self.create_unique_ident();
  //               self.collectors.push(Expr::Ident(ident.clone()));
  //               self.ident_index += 1;
  //               *module_item = ModuleItem::Stmt(Stmt::Decl(Decl::Var(Box::new(VarDecl {
  //                 span: DUMMY_SP,
  //                 kind: VarDeclKind::Const,
  //                 declare: false,
  //                 decls: vec![VarDeclarator {
  //                   init: Some(Box::new(Expr::Call(call_expr.clone()))),
  //                   definite: false,
  //                   span: DUMMY_SP,
  //                   name: Pat::Ident(BindingIdent {
  //                     id: ident,
  //                     type_ann: None,
  //                   }),
  //                 }],
  //               }))));
  //               break;
  //             }
  //           }
  //         }
  //         _ => {}
  //       },
  //       _ => {}
  //     },
  //     ModuleItem::ModuleDecl(_) => {}
  //   }
  // }

  // fn create_unique_ident(&mut self) -> Ident {
  //   Ident {
  //     optional: false,
  //     span: DUMMY_SP,
  //     sym: format!("__{}", self.ident_index).clone().into(),
  //   }
  // }

  fn add_imports(&mut self, module: &mut Module) {
    for import in self.input_imports.iter() {
      module.body.insert(
        0,
        ModuleItem::ModuleDecl(ModuleDecl::Import(ImportDecl {
          span: DUMMY_SP,
          asserts: None,
          type_only: false,
          src: Box::new(Str {
            span: DUMMY_SP,
            raw: None,
            value: import.source.clone().into(),
          }),
          specifiers: vec![ImportSpecifier::Named(ImportNamedSpecifier {
            span: DUMMY_SP,
            imported: None,
            is_type_only: false,
            local: Ident {
              span: DUMMY_SP,
              optional: false,
              sym: import.specifier.clone().into(),
            },
          })],
        })),
      );
    }
  }
}

impl VisitMut for TransformVisitor {
  fn visit_mut_member_expr(&mut self, member_expr: &mut MemberExpr) {
    self.transform_name_space_import_ident(member_expr);
    member_expr.visit_mut_children_with(self);
  }

  fn visit_mut_call_expr(&mut self, call_expr: &mut CallExpr) {
    call_expr.visit_mut_children_with(self);
    self.transform_call_expr_args(call_expr);
  }

  fn visit_mut_var_decl(&mut self, var_decl: &mut VarDecl) {
    var_decl.visit_mut_children_with(self);
    // self.var_decl_extract_collector(var_decl);
  }

  fn visit_mut_module_item(&mut self, module_item: &mut ModuleItem) {
    module_item.visit_mut_children_with(self);
    // self.top_level_call_expr_extract_collector(module_item);
  }

  fn visit_mut_module(&mut self, module: &mut Module) {
    self.transform_imports(module);
    self.add_imports(module);
    module.visit_mut_children_with(self);
  }
}

#[plugin_transform]
pub fn process_transform(program: Program, metadata: TransformPluginProgramMetadata) -> Program {
  let config = parse_config(&metadata.get_transform_plugin_config().expect(""));
  program.fold_with(&mut as_folder(TransformVisitor::new(config)))
}

#[cfg(test)]
mod tests {
  use super::config::{parse_config, InputConfig};
  use crate::TransformVisitor;
  use serde_json::json;
  use swc_core::ecma::{transforms::testing::test, visit::as_folder};

  fn get_config() -> InputConfig {
    let config_json = json!({
        "transforms": [
          {
            "source": "target_source",
            "from": "target",
            "to": "__target"
          },
        ],
        "injectArguments": [
          {
            "value": [
              {
                "type": "Object",
                "properties": [
                  {
                    "key": "color",
                    "value": {
                      "type": "String",
                      "value": "red0"
                    },
                  },
                ],
              }
            ],
            "index": 0
          },
          {
            "value": [
              {
                "type": "Object",
                "properties": [
                  {
                    "key": "color",
                    "value": {
                      "type": "String",
                      "value": "red1"
                    },
                  },
                ],
              }
            ],
            "index": 1
          },
          {
            "value": [
              {
                "type": "Object",
                "properties": [
                  {
                    "key": "color",
                    "value": {
                      "type": "String",
                      "value": "red3"
                    },
                  },
                ],
              }
            ],
            "index": 3
          },
          {
            "value": [
              {
                "type": "Object",
                "properties": [
                  {
                    "key": "color",
                    "value": {
                      "type": "String",
                      "value": "red5"
                    },
                  },
                ],
              }
            ],
            "index": 5
          }
        ],
        "imports": []
    })
    .to_string();
    parse_config(&config_json)
  }
  test!(
    Default::default(),
    |_| as_folder(TransformVisitor::new(get_config())),
    basic,
    // Input codes
    r#"
    import { target } from 'target_source';
    const x0 = target({},0);
    "#,
    // Output codes after
    r#"
    import { __target as target } from 'target_source';
    const x0 = target({"color" : "red0" });
    "#
  );

  test!(
    Default::default(),
    |_| as_folder(TransformVisitor::new(get_config())),
    as_basic,
    // Input codes
    r#"
    import { target as _target1 } from 'target_source';
    import { target as _target2 } from 'target_source';
    const x0 = _target1({},0);
    const x1 = _target2({},1);
    "#,
    // Output codes after
    r#"
    import { __target as _target1 } from 'target_source';
    import { __target as _target2 } from 'target_source';
    const x0 = _target1({ "color": "red0" });
    const x1 = _target2({ "color": "red1" });
    "#
  );

  test!(
    Default::default(),
    |_| as_folder(TransformVisitor::new(get_config())),
    namespace,
    // Input codes
    r#"
    import * as namespace1 from 'target_source';
    import * as namespace2 from 'target_source';
    const x0 = namespace1.target({}, 0);
    const x1 = namespace2.target({}, 1);
    "#,
    // Output codes after
    r#"
    import * as namespace1 from 'target_source';
    import * as namespace2 from 'target_source';
    const x0 = namespace1.__target({ "color" : "red0" });
    const x1 = namespace2.__target({ "color" : "red1" });
    "#
  );
  test!(
    Default::default(),
    |_| as_folder(TransformVisitor::new(get_config())),
    mix,
    // Input codes
    r#"
    import { target, target as _target } from 'target_source';
    import { target as __target } from 'target_source';
    import * as namespace from 'target_source';
    const x0 = target({}, 0);
    const x1 = _target({}, {}, 1);
    const x2 = __target({}, {}, 2);
    const x3 = namespace.target({}, 3);
    const x4 = namespace.dummy({}, {}, 4);
    "#,
    // Output codes after
    r#"
    import { __target as target, __target as _target } from 'target_source';
    import { __target as __target } from 'target_source';
    import * as namespace from 'target_source';
    const x0 = target({ "color": "red0" });
    const x1 = _target({ "color": "red1" });
    const x2 = __target();
    const x3 = namespace.__target({ "color": "red3" });
    const x4 = namespace.dummy({}, {}, 4);
    "#
  );
  test!(
    Default::default(),
    |_| as_folder(TransformVisitor::new(get_config())),
    last_import_mix,
    // Input codes
    r#"
    const x0 = target({}, 0);
    const x1 = _target({}, {}, 1);
    const x2 = __target({}, {}, 2);
    const x3 = namespace.target({}, 3);
    const x4 = namespace.dummy({}, {}, 4);
    import { target, target as _target } from 'target_source';
    import { target as __target } from 'target_source';
    import * as namespace from 'target_source';
    "#,
    // Output codes after
    r#"
    const x0 = target({ "color": "red0" });
    const x1 = _target({ "color": "red1" });
    const x2 = __target();
    const x3 = namespace.__target({ "color": "red3" });
    const x4 = namespace.dummy({}, {}, 4);
    import { __target as target, __target as _target } from 'target_source';
    import { __target as __target } from 'target_source';
    import * as namespace from 'target_source';
    "#
  );
}
