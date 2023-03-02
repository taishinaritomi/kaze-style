use serde::{Deserialize, Serialize};

use helper::ast_node::Node;
use helper::common_config::InputTransform;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct InputConfig {
  pub transforms: Vec<InputTransform>,
  pub build_arg: Node,
  pub transformed_comment: String,
}

pub fn parse_config(json: &str) -> InputConfig {
  serde_json::from_str::<InputConfig>(&json).expect("Invalid plugin config")
}
