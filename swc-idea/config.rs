use serde::{Deserialize, Serialize};

use super::ast_node::Node;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct InputTransform {
  pub source: String,
  pub from: String,
  pub pre: String,
  pub to: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct InputImport {
  pub source: String,
  pub specifier: String,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct InputCollector {
  pub export_name: String,
  pub specifier: String,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct InputConfig {
  pub transforms: Vec<InputTransform>,
  pub build_arg: Node,
  pub imports: Vec<InputImport>,
  pub collector: InputCollector,
}

pub fn parse_config(json: &str) -> InputConfig {
  serde_json::from_str::<InputConfig>(&json).expect("Invalid plugin config")
}
