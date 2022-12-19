export class ClassName extends String {
  object: Record<string, string>;
  other: string[];
  constructor(object: ClassName['object'], other: ClassName['other'] = []) {
    super([...Object.values(object), ...other].join(' '));
    this.object = object;
    this.other = other;
  }
}
