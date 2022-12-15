export class ClassName extends String {
  /**
   * object
   */
  o: Record<string, string>;
  /**
   * etc
   */
  e: string[];
  constructor(object: ClassName['o'], etc: ClassName['e'] = []) {
    super([...Object.values(object), ...etc].join(' '));
    this.o = object;
    this.e = etc;
  }
}
