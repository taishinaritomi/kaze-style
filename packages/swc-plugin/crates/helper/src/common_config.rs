use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct InputTransform {
  pub source: String,
  pub from: String,
  pub to: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct InputImport {
  pub source: String,
  pub specifier: String,
}
