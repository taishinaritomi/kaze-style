use std::collections::HashMap;

use swc_core::{
  ecma::{
    ast::Program,
    transforms::testing::test,
    visit::{as_folder, FoldWith, VisitMut},
  },
  plugin::{plugin_transform, proxies::TransformPluginProgramMetadata},
};

#[derive(serde::Deserialize)]
pub struct Style {
  index: u8,
  classes_object: HashMap<String, HashMap<String, String>>,
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

pub struct TransformVisitor;

impl VisitMut for TransformVisitor {}

#[plugin_transform]
pub fn process_transform(program: Program, _metadata: TransformPluginProgramMetadata) -> Program {
  program.fold_with(&mut as_folder(TransformVisitor))
}

test!(
  Default::default(),
  |_| as_folder(TransformVisitor),
  test,
  // Input codes
  r#"console.log("transform");"#,
  // Output codes
  r#"console.log("transform");"#
);
