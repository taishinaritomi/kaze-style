export class ClassName extends String {
  object: Record<string, string>;
  constructor(className: string, object: ClassName['object']) {
    super(className);
    this.object = object;
  }
}
