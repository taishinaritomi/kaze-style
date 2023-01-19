export class ClassName extends String {
  // Record
  private r: Record<string, string>;
  // Value
  private v: string;
  // Other
  private o: string[];
  constructor(record: ClassName['r'], other: ClassName['o'] = []) {
    const string = [...Object.values(record), ...other].join(' ');
    super(string);
    this.v = string;
    this.r = record;
    this.o = other;
  }
  string = () => this.v;
  static = () => this.r;
  other = () => this.o;
}
export type ClassNameType = ClassName & string;
export type ClassNameRecord = ClassName['r'];
