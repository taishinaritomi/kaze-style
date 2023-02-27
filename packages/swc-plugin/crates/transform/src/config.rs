use serde::{Deserialize, Serialize};

use helper::ast_node::Node;
use helper::common_config::InputTransform;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct InputConfig {
  pub transforms: Vec<InputTransform>,
  pub inject_args: Vec<InputArgument>,
  pub imports: Vec<InputImport>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct InputImport {
  pub source: String,
  pub specifier: String,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct InputArgument {
  pub value: Vec<Node>,
  pub index: usize,
}

pub fn parse_config(json: &str) -> InputConfig {
  serde_json::from_str::<InputConfig>(&json).expect("Invalid plugin config")
}
