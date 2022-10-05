export class ClassName extends String {
  object: Record<string, string>;
  others: string[];
  constructor(object: ClassName['object'], others: ClassName['others'] = []) {
    super([...Object.values(object), ...others].join(' '));
    this.others = others;
    this.object = object;
  }
}
