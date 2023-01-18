export class ClassName extends String {
  obj: Record<string, string>;
  str: string;
  other: string[];
  constructor(obj: ClassName['obj'], other: ClassName['other'] = []) {
    const str = [...Object.values(obj), ...other].join(' ');
    super(str);
    this.str = str;
    this.obj = obj;
    this.other = other;
  }
}

export type ClassNameType = ClassName & string;
export type ClassNameObject = ClassName['obj'];
