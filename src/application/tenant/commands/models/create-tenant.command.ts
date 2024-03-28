export class CreateTenantCommand {
  public readonly domain: Required<Readonly<string>>;
  public readonly name: Required<Readonly<string>>;
  constructor(domain: string, name: string) {
    this.domain = domain;
    this.name = name;
  }
}
