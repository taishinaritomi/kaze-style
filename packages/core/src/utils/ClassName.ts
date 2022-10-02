export class ClassName extends String {
  object: Record<string, string>;
  constructor(object: ClassName['object']) {
    super(Object.values(object).join(' '));
    this.object = object;
  }
}
