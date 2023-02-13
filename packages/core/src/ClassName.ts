export interface ClassName {
  Type: ClassName & string;
  String: string;
  Static: Record<string, string>;
  Other: string[];
}
export class ClassName extends String {
  private readonly _: [
    string: ClassName['String'],
    _static: ClassName['Static'],
    other: ClassName['Other'],
  ];
  constructor(_static: ClassName['Static'], other: ClassName['Other'] = []) {
    const string = [...Object.values(_static), ...other].join(' ');
    super(string);
    this._ = [string, _static, other];
  }
  string = (): ClassName['String'] => this._[0];
  static = (): ClassName['Static'] => this._[1];
  other = (): ClassName['Other'] => this._[2];
}
